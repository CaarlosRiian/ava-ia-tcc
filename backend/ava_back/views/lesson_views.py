from datetime import timedelta
from operator import sub
from django.utils import timezone
from django.core.exceptions import PermissionDenied
import traceback
import logging

from rest_framework import filters, status, generics, viewsets
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView

from ..models import ( Flashcard, Module, Lesson, LessonMaterial, StudentChallengeSubmission, StudentPerformance, UserFlashcardProgress, LessonSubmission 
)
from ..serializers import ( ModuleSerializer, LessonSerializer, LessonMaterialSerializer, 
    InstructorLessonSerializer, FlashcardSerializer, UserFlashcardProgressSerializer, FlashcardAnswerSerializer, StudentChallengeSubmissionSerializer )
from ..services.service import LessonService

logger = logging.getLogger(__name__)

class ModuleViewSet(ModelViewSet):
    serializer_class = ModuleSerializer
    queryset = Module.objects.all()
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

    def get_queryset(self):
        return Module.objects.select_related('course').all()


class LessonViewSet(ModelViewSet):
    queryset = Lesson.objects.all()
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update', 'create']:
            return InstructorLessonSerializer
        return LessonSerializer

    def get_queryset(self):
        return Lesson.objects.select_related('module__course').all()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        lesson = self.get_object()
        data, status_code = LessonService.marcar_aula_como_concluida(user=request.user, lesson=lesson)
        return Response(data, status=status_code)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def generate_ai(self, request, pk=None):
        lesson = self.get_object()
        ai_content = LessonService.processar_ia_da_aula(lesson)
        return Response({
            "summary": ai_content.summary,
            "quiz_json": ai_content.quiz_json
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def chat(self, request, pk=None):
        lesson = self.get_object()
        return LessonService.handle_chat_action(self, request, lesson)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def get_quiz(self, request, pk=None):
        lesson = self.get_object()
        return LessonService.handle_get_quiz(lesson)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='submit_quiz')
    def submit_quiz(self, request, pk=None):
        lesson = self.get_object()
        return LessonService.handle_submit_quiz_action(request, lesson)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='meu-desempenho')
    def meu_desempenho(self, request):
        performances = StudentPerformance.objects.filter(
            user=request.user
        ).select_related('lesson').order_by('created_at')

        data = [
            {
                "id": p.id,
                "score_percentage": p.score_percentage,
                "lesson_title": p.lesson.title if p.lesson else "Aula sem título",
                "created_at": p.created_at.isoformat() if p.created_at else None,
                "weak_topics": p.weak_topics,
                "strong_topics": p.strong_topics
            }
            for p in performances
        ]

        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='generate_flashcards')
    def generate_flashcards(self, request, pk=None):
        lesson = self.get_object()
        data, status_code = LessonService.gerar_flashcards_da_aula(lesson)
        return Response(data, status=status_code)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated], url_path='flashcards')
    def list_flashcards(self, request, pk=None):
        lesson = self.get_object()
        flashcards = Flashcard.objects.filter(lesson=lesson)
        serializer = FlashcardSerializer(flashcards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated], url_path='challenge')
    def get_challenge(self, request, pk=None):
        lesson = self.get_object()
        return LessonService.handle_get_challenge(lesson)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated], url_path='submissions')
    def submissions(self, request, pk=None):
        lesson = self.get_object()

        if request.user.role != "professor" and not request.user.is_staff:
            raise PermissionDenied("Você não tem permissão para ver estas submissões.")

        submissions = LessonSubmission.objects.filter(
            lesson=lesson
        ).select_related('student', 'lesson')
        
        data = [
            {
                "id": str(sub.id),
                "student_name": getattr(sub.student, 'get_full_name', lambda: '')() or getattr(sub.student, 'name', None) or sub.student.username,
                "student_email": getattr(sub.student, 'email', ""),
                "student_answer": getattr(sub, 'student_answer', ''),
                "ai_feedback": getattr(sub, 'ai_feedback', ''),
                "grade": str(sub.grade) if sub.grade is not None else "10.00",
                "created_at": sub.created_at.strftime("%d/%m/%Y %H:%M") if sub.created_at else None,
            }
            for sub in submissions
        ]
        
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'post'], permission_classes=[IsAuthenticated])
    def submit(self, request, pk=None):
        lesson = self.get_object()
        user = request.user

        if request.method == 'GET':
            try:
                challenge = lesson.challenge
                if not challenge:
                    return Response({"detail": "Nenhum desafio encontrado para esta aula."}, status=status.HTTP_404_NOT_FOUND)
                
                submission = StudentChallengeSubmission.objects.filter(student=user, challenge=challenge).first()
                if not submission:
                    return Response({}, status=status.HTTP_200_OK)
                
                return Response({
                    "answer_text": submission.answer_text,
                    "feedback": submission.improvements, 
                    "score": submission.score_percentage
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"detail": "Erro ao buscar submissão anterior."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        answer_text = request.data.get('answer_text') or request.data.get('student_answer')
        
        if not answer_text:
            return Response({"detail": "O texto da resposta é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            data, status_code = LessonService.handle_submit_challenge_action(
                user=user, 
                lesson=lesson, 
                answer_text=answer_text
            )
            return Response(data, status=status_code)
        except Exception as e:
            print("--- [ERRO CRÍTICO NO SUBMIT] ---")
            traceback.print_exc()
            logger.error(f"Erro ao submeter desafio: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LessonSubmitView(APIView):
    def post(self, request, pk=None):
        try:
            lesson = Lesson.objects.get(pk=pk)
        except Lesson.DoesNotExist:
            return Response({"error": "Aula não encontrada."}, status=status.HTTP_404_NOT_FOUND)
            
        answer_text = request.data.get('answer_text', '')
        
        data, status_code = LessonService.handle_submit_challenge_action(
            user=request.user,
            lesson=lesson,
            answer_text=answer_text
        )
        return Response(data, status=status_code)

class FlashcardViewSet(ModelViewSet):
    serializer_class = UserFlashcardProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserFlashcardProgress.objects.filter(
            user=self.request.user
        ).select_related('flashcard', 'flashcard__lesson')

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='hoje')
    def revisoes_de_hoje(self, request):
        agora = timezone.now()
        
        progressos = UserFlashcardProgress.objects.filter(
            user=request.user,
            next_review__lte=agora
        ).select_related('flashcard')

        serializer = self.get_serializer(progressos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='responder')
    def responder(self, request, pk=None):
        serializer = FlashcardAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        feedback = serializer.validated_data['feedback']
        agora = timezone.now()

        progress, _ = UserFlashcardProgress.objects.get_or_create(
            user=request.user,
            flashcard_id=pk,
            defaults={'interval_days': 1, 'status': 'aprendendo'}
        )

        if feedback == 'errei':
            progress.interval_days = 1
            progress.status = 'aprendendo'
            progress.next_review = agora + timedelta(days=1)
        elif feedback == 'medio':
            progress.interval_days = max(2, progress.interval_days * 2)
            progress.status = 'aprendendo'
            progress.next_review = agora + timedelta(days=progress.interval_days)
        elif feedback == 'facil':
            progress.interval_days = max(4, progress.interval_days * 3)
            progress.status = 'revisado'
            progress.next_review = agora + timedelta(days=progress.interval_days)

        progress.last_reviewed_at = agora
        progress.save()

        return Response({
            "message": "Resposta registrada com sucesso!",
            "proxima_revisao": progress.next_review,
            "status": progress.status
        }, status=status.HTTP_200_OK)


class LessonMaterialViewSet(ModelViewSet):
    serializer_class = LessonMaterialSerializer
    queryset = LessonMaterial.objects.all()
    permission_classes = [IsAuthenticated] 
    parser_classes = [MultiPartParser, FormParser] 

    def get_queryset(self):
        queryset = LessonMaterial.objects.all()
        lesson_id = self.request.query_params.get('lesson_id')
        if lesson_id:
            queryset = queryset.filter(lesson_id=lesson_id)
        return queryset

    def perform_create(self, serializer):
        lesson = serializer.validated_data['lesson']
        if self.request.user.role != "professor" or lesson.module.course.professor != self.request.user:
            raise PermissionDenied("Você não tem permissão para adicionar materiais a esta aula.")
        
        file_obj = self.request.data.get('file')
        if file_obj and not serializer.validated_data.get('raw_content'):
            serializer.save(raw_content=file_obj.name)
        else:
            serializer.save()


class ProfessorChallengeSubmissionsView(generics.ListAPIView):
    serializer_class = StudentChallengeSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return StudentChallengeSubmission.objects.filter(
            challenge__lesson__module__course__professor=user
        )