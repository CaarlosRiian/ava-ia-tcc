from django.core.exceptions import PermissionDenied
from rest_framework import filters, status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from ..models import Module, Lesson, LessonMaterial, StudentPerformance
from ..serializers import (
    ModuleSerializer, LessonSerializer, LessonMaterialSerializer, InstructorLessonSerializer
)
from ..services.service import LessonService


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
        data, status_code = LessonService.processar_ia_da_aula(lesson)
        return Response(data, status=status_code)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def chat(self, request, pk=None):
        lesson = self.get_object()
        return LessonService.handle_chat_action(self, request, lesson)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def get_quiz(self, request, pk=None):
        lesson = self.get_object()
        return LessonService.handle_get_quiz(self, lesson)

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
                "created_at": p.created_at.strftime("%d/%m"),
                "weak_topics": p.weak_topics,
                "strong_topics": p.strong_topics
            }
            for p in performances
        ]

        return Response(data, status=status.HTTP_200_OK)


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