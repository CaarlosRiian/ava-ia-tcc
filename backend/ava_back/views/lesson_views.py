from datetime import timedelta
from operator import sub
from django.utils import timezone
from django.core.exceptions import PermissionDenied
import traceback
import logging

from ..permissions import IsAdminUserRole
from ava_back import permissions
from rest_framework import filters, status, generics, viewsets, permissions as drf_permissions
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from django.core.paginator import Paginator


from ..models import ( Module, Lesson, LessonMaterial, StudentChallengeSubmission, StudentPerformance, LessonSubmission, LessonComment, CourseReview, LessonChallenge )
from ..serializers import ( LessonCommentSerializer, ModuleSerializer, LessonSerializer, LessonMaterialSerializer, InstructorLessonSerializer, StudentChallengeSubmissionSerializer, LessonCommentSerializer, CourseReviewSerializer )
from ..services import LessonService

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

    def perform_create(self, serializer):
        lesson = serializer.save()
        self._save_challenge_from_request(lesson, self.request)

    def perform_update(self, serializer):
        lesson = serializer.save()
        self._save_challenge_from_request(lesson, self.request)

    def _save_challenge_from_request(self, lesson, request):
        has_challenge = request.data.get('has_challenge')
        
        if isinstance(has_challenge, str):
            has_challenge = has_challenge.lower() == 'true'

        if has_challenge:
            title = request.data.get('challenge_title')
            description = request.data.get('challenge_description')
            criteria = request.data.get('challenge_criteria')

            if title or description:
                LessonChallenge.objects.update_or_create(
                    lesson=lesson,
                    defaults={
                        'title': title or f"Desafio: {lesson.title}",
                        'description': description or "Resolva o desafio prático proposto.",
                        'evaluation_criteria': criteria or "Avalie a lógica e a sintaxe de forma objetiva.",
                        'taxonomy_level': 'analisar'
                    }
                )
        else:
            LessonChallenge.objects.filter(lesson=lesson).delete()

    @action(detail=True, methods=['post'], permission_classes=[drf_permissions.IsAuthenticated])
    def complete(self, request, pk=None):
        lesson = self.get_object()
        data, status_code = LessonService.marcar_aula_como_concluida(user=request.user, lesson=lesson)
        return Response(data, status=status_code)

    @action(detail=True, methods=['post'], permission_classes=[drf_permissions.IsAuthenticated])
    def generate_ai(self, request, pk=None):
        lesson = self.get_object()
        ai_content = LessonService.processar_ia_da_aula(lesson)
        return Response({
            "summary": ai_content.summary,
            "quiz_json": ai_content.quiz_json
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[drf_permissions.IsAuthenticated])
    def chat(self, request, pk=None):
        lesson = self.get_object()
        return LessonService.handle_chat_action(self, request, lesson)

    @action(detail=True, methods=['get'], permission_classes=[drf_permissions.IsAuthenticated])
    def get_quiz(self, request, pk=None):
        lesson = self.get_object()
        force_refresh = request.query_params.get('refresh', 'false').lower() == 'true'
        return LessonService.handle_get_quiz(lesson, force_refresh=force_refresh)

    @action(detail=True, methods=['post'], permission_classes=[drf_permissions.IsAuthenticated], url_path='submit_quiz')
    def submit_quiz(self, request, pk=None):
        lesson = self.get_object()
        return LessonService.handle_submit_quiz_action(request, lesson)

    @action(detail=True, methods=['get'], permission_classes=[drf_permissions.IsAuthenticated], url_path='submissions')
    def submissions(self, request, pk=None):
        lesson = self.get_object()

        if request.user.role != "professor" and not request.user.is_staff:
            raise PermissionDenied("Você não tem permissão para ver estas submissões.")

        challenge = LessonChallenge.objects.filter(lesson=lesson).first()
        if not challenge:
            return Response([], status=status.HTTP_200_OK)

        submissions = StudentChallengeSubmission.objects.filter(
            challenge=challenge
        ).select_related('student', 'challenge')
        
        serializer = StudentChallengeSubmissionSerializer(submissions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'post'], permission_classes=[drf_permissions.IsAuthenticated])
    def submit(self, request, pk=None):
        lesson = self.get_object()
        user = request.user

        if request.method == 'GET':
            challenge = LessonChallenge.objects.filter(lesson=lesson).first()
            if not challenge:
                return Response({"submitted": False, "message": "Nenhum desafio para esta aula."}, status=status.HTTP_200_OK)
            
            submission = StudentChallengeSubmission.objects.filter(student=user, challenge=challenge).first()
            if not submission:
                return Response({"submitted": False, "score": 0.0}, status=status.HTTP_200_OK)
                
            return Response({
                "submitted": True,
                "score": submission.score_percentage,
                "feedback": submission.improvements,
                "answer_text": submission.answer_text,
                "passed": submission.score_percentage >= 70.0
            }, status=status.HTTP_200_OK)

        answer_text = request.data.get('answer_text') or request.data.get('student_answer')
        
        if not answer_text:
            return Response({"detail": "O texto da resposta é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            resultado = LessonService.handle_submit_challenge_action(
                user=user, 
                lesson=lesson, 
                answer_text=answer_text
            )
            
            if isinstance(resultado, tuple):
                data, status_code = resultado
                return Response(data, status=status_code)
            
            return Response(resultado, status=status.HTTP_200_OK)
            
        except Exception as e:
            traceback.print_exc()
            logger.error(f"Erro ao submeter desafio: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class IsOwnerOrInstructorOrReadOnly(drf_permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in drf_permissions.SAFE_METHODS:
            return True
        
        if obj.user == request.user:
            return True
        
        course_owner = (
            getattr(obj.course, 'instructor', None) or 
            getattr(obj.course, 'professor', None) or 
            getattr(obj.course, 'user', None)
        )
        
        if request.method in ['PUT', 'PATCH'] and course_owner == request.user:
            return True
            
        return False
class CourseReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseReviewSerializer
    permission_classes = [drf_permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        return CourseReview.objects.filter(course_id=course_id).order_by('-created_at')

    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_id')
        serializer.save(user=self.request.user, course_id=course_id)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['get'], permission_classes=[drf_permissions.IsAuthenticated], url_path='challenge')
    def get_challenge(self, request, pk=None):
        lesson = self.get_object()
        return LessonService.handle_get_challenge(lesson)

    @action(detail=True, methods=['get'], permission_classes=[drf_permissions.IsAuthenticated], url_path='submissions')
    def submissions(self, request, pk=None):
        lesson = self.get_object()

        if request.user.role != "professor" and not request.user.is_staff:
            raise PermissionDenied("Você não tem permissão para ver estas submissões.")

        from ..models import LessonChallenge, StudentChallengeSubmission
        from ..serializers import StudentChallengeSubmissionSerializer

        challenge = LessonChallenge.objects.filter(lesson=lesson).first()
        if not challenge:
            return Response([], status=status.HTTP_200_OK)

        submissions = StudentChallengeSubmission.objects.filter(
            challenge=challenge
        ).select_related('student', 'challenge')
        
        serializer = StudentChallengeSubmissionSerializer(submissions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'post'], permission_classes=[drf_permissions.IsAuthenticated])
    def submit(self, request, pk=None):
        lesson = self.get_object()
        user = request.user

        from ..models import LessonChallenge, StudentChallengeSubmission

        if request.method == 'GET':
            challenge = LessonChallenge.objects.filter(lesson=lesson).first()
            if not challenge:
                return Response({"submitted": False, "message": "Nenhum desafio para esta aula."}, status=status.HTTP_200_OK)
            
            submission = StudentChallengeSubmission.objects.filter(student=user, challenge=challenge).first()
            if not submission:
                return Response({"submitted": False, "score": 0.0}, status=status.HTTP_200_OK)
                
            return Response({
                "submitted": True,
                "score": submission.score_percentage,
                "feedback": submission.improvements,
                "answer_text": submission.answer_text,
                "passed": submission.score_percentage >= 70.0
            }, status=status.HTTP_200_OK)

        answer_text = request.data.get('answer_text') or request.data.get('student_answer')
        
        if not answer_text:
            return Response({"detail": "O texto da resposta é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            resultado = LessonService.handle_submit_challenge_action(
                user=user, 
                lesson=lesson, 
                answer_text=answer_text
            )
            
            if isinstance(resultado, tuple):
                data, status_code = resultado
                return Response(data, status=status_code)
            
            return Response(resultado, status=status.HTTP_200_OK)
            
        except Exception as e:
            traceback.print_exc()
            logger.error(f"Erro ao submeter desafio: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get', 'post'], url_path='comments')
    def comments(self, request, pk=None):
        lesson = self.get_object()
        
        if request.method == 'GET':
            total_count = lesson.comments.count()
            root_comments = lesson.comments.filter(parent__isnull=True).order_by('-created_at')

            page_number = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 5))

            paginator = Paginator(root_comments, page_size)
            page_obj = paginator.get_page(page_number)

            serializer = LessonCommentSerializer(page_obj.object_list, many=True)

            return Response({
                'total_count': total_count,
                'has_next': page_obj.has_next(),
                'next_page': page_number + 1 if page_obj.has_next() else None,
                'results': serializer.data
            })
            
        elif request.method == 'POST':
            serializer = LessonCommentSerializer(data=request.data)
            if serializer.is_valid():
                parent_id = request.data.get('parent')
                parent_comment = None
                if parent_id:
                    parent_comment = LessonComment.objects.filter(id=parent_id, lesson=lesson).first()
                
                serializer.save(user=request.user, lesson=lesson, parent=parent_comment)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put', 'delete'], url_path=r'comments/(?P<comment_id>\d+)')
    def comment_detail(self, request, pk=None, comment_id=None):
        try:
            comment = LessonComment.objects.get(id=comment_id, lesson_id=pk)
        except LessonComment.DoesNotExist:
            return Response({"error": "Comentário não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if comment.user != request.user:
            return Response({"error": "Você não tem permissão para alterar este comentário."}, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'PUT':
            content = request.data.get('content')
            if not content:
                return Response({"error": "O conteúdo não pode ser vazio."}, status=status.HTTP_400_BAD_REQUEST)
            comment.content = content
            comment.save()
            serializer = LessonCommentSerializer(comment)
            return Response(serializer.data)

        elif request.method == 'DELETE':
            comment.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

class CourseReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CourseReview.objects.all()
    serializer_class = CourseReviewSerializer
    permission_classes = [drf_permissions.IsAuthenticated, IsOwnerOrInstructorOrReadOnly]

class LessonSubmitView(APIView):
    def get(self, request, pk=None):
        try:
            lesson = Lesson.objects.get(pk=pk)
        except Lesson.DoesNotExist:
            return Response({"error": "Aula não encontrada."}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            LessonChallengeModel = apps.get_model('ava_back', 'LessonChallenge') if 'apps' in globals() else LessonChallenge
            challenge = LessonChallengeModel.objects.filter(lesson=lesson).first()
            
            if not challenge:
                return Response({"submitted": False, "message": "Nenhum desafio encontrado para esta aula."}, status=status.HTTP_200_OK)
                
            submission = StudentChallengeSubmission.objects.filter(student=request.user, challenge=challenge).first()
            
            if not submission:
                return Response({"submitted": False}, status=status.HTTP_200_OK)
                
            return Response({
                "submitted": True,
                "answer_text": submission.answer_text,
                "feedback": submission.improvements,
                "score": submission.score_percentage,
                "lesson_completed": submission.score_percentage >= 70.0
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

class LessonMaterialViewSet(ModelViewSet):
    serializer_class = LessonMaterialSerializer
    queryset = LessonMaterial.objects.all()
    permission_classes = [drf_permissions.IsAuthenticated] 
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
    permission_classes = [drf_permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return StudentChallengeSubmission.objects.filter(
            challenge__lesson__module__course__professor=user
        )