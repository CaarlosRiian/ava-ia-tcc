from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Prefetch, Sum

from rest_framework import filters, status
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import User, Course, Category, Module, Lesson, Enrollment, LessonProgress, InstructorRequest
from .serializers import CourseSerializer, UserSerializer, CategorySerializer, CourseDetailSerializer, ModuleSerializer, LessonSerializer, EnrollmentSerializer, EmailTokenSerializer, InstructorRequestSerializer
from .services.ai_service import generate_ai_for_lesson

class UserViewSet(ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.filter(status='ativo')

    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]

    filter_backends = [filters.SearchFilter]
    search_fields = ['username']

class CategoryViewSet(ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.filter()

    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]

    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class CourseViewSet(ModelViewSet):
    serializer_class = CourseSerializer
    queryset = Course.objects.all()
    # queryset = Course.objects.filter(published=True)

    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['title', 'category__name']
    filterset_fields = ['category']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer

    def get_queryset(self):
        if self.action == 'retrieve':
            return Course.objects.select_related('professor','category').prefetch_related(
                Prefetch('modules', queryset=Module.objects.prefetch_related('lessons'))
            )
        return super().get_queryset()

    def perform_create(self, serializer):
        serializer.save(professor=self.request.user) 

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_courses(self, request):
        user = request.user

        enrollments = Enrollment.objects.select_related('course').filter(
            user=user,
            is_active=True
        )

        data = []

        for enrollment in enrollments:
            course = enrollment.course

            total_lessons = Lesson.objects.filter(
                module__course=course
            ).count()

            completed_lessons = LessonProgress.objects.filter(
                user=user,
                lesson__module__course=course,
                completed=True
            ).count()

            progress = 0
            if total_lessons > 0:
                progress = (completed_lessons / total_lessons) * 100

            data.append({
                "course_id": course.id,
                "title": course.title,
                "thumbnail": course.thumbnail_url,
                "professor": course.professor.username,
                "progress": round(progress, 2)
            })

        return Response(data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def progress(self, request, pk=None):
        course = self.get_object()
        user = request.user

        total_lessons = Lesson.objects.filter(module__course=course).count()

        completed_lessons = LessonProgress.objects.filter(
            user=user,
            lesson__module__course=course,
            completed=True
        ).count()

        progress_percentage = 0
        if total_lessons > 0:
            progress_percentage = (completed_lessons / total_lessons) * 100

        return Response({
            "course": course.title,
            "total_lessons": total_lessons,
            "completed_lessons": completed_lessons,
            "progress": round(progress_percentage, 2)
        })

class ModuleViewSet(ModelViewSet):
    serializer_class = ModuleSerializer
    queryset = Module.objects.all()
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

    def get_queryset(self):
        return Module.objects.select_related('course').all()

class LessonViewSet(ModelViewSet):
    serializer_class = LessonSerializer
    queryset = Lesson.objects.all()
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

    def get_queryset(self):
        return Lesson.objects.select_related('module').all()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        lesson = self.get_object()
        user = request.user

        if not Enrollment.objects.filter(
            user=user,
            course=lesson.module.course,
            is_active=True
        ).exists():
            return Response(
                {"error": "Você não está matriculado nesse curso"},
                status=status.HTTP_403_FORBIDDEN
            )

        progress, created = LessonProgress.objects.get_or_create(
            user=user,
            lesson=lesson
        )

        if progress.completed:
            return Response({
                "message": "Aula já estava concluída"
            })

        progress.completed = True
        progress.save()

        return Response({
            "message": "Aula marcada como concluída"
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def generate_ai(self, request, pk=None):
        lesson = self.get_object()

        ai_content, created = AIAssistant.objects.get_or_create(lesson=lesson)

        ai_content.summary = "Resumo gerado automaticamente (mock)"
        ai_content.quiz_json = {
            "questions": [
                {
                    "question": "O que foi visto na aula?",
                    "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
                    "correct": "Opção A"
                }
            ]
        }
        ai_content.save()

        return Response({
            "message": "Conteúdo de IA gerado com sucesso"
        }, status=status.HTTP_200_OK)

class EnrollmentViewSet(ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data['course']

        if Enrollment.objects.filter(user=user, course=course).exists():
            raise ValidationError("Você já está matriculado neste curso.")

        serializer.save(user=user)

@api_view(['POST'])
def generate_ai(request, lesson_id):





    
    data = generate_ai_for_lesson(lesson_id)

    if not data:
        return Response({"error": "Falha ao gerar IA"}, status=400)

    return Response(data)

class EmailTokenView(TokenObtainPairView):
    serializer_class = EmailTokenSerializer

class InstructorRequestViewSet(ModelViewSet):
    queryset = InstructorRequest.objects.select_related("user").all()
    serializer_class = InstructorRequestSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def aprovar(self, request, pk=None):
        obj = self.get_object()

        obj.status = "approved"
        obj.save()

        user = obj.user
        user.role = "professor"
        user.save()

        return Response({"status": "aprovado"})

    @action(detail=True, methods=["post"])
    def rejeitar(self, request, pk=None):
        obj = self.get_object()
        obj.status = "rejected"
        obj.save()
        return Response({"status": "rejeitado"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user

    return Response({
        "id": user.id,
        "name": user.username,   
        "email": user.email,
        "role": user.role
    })

@api_view(["GET"])
def professor_by_slug(request, slug):
    try:
        professor = User.objects.get(slug=slug, role="professor")
    except User.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    courses = Course.objects.filter(professor=professor, published=True)

    total_lessons = Lesson.objects.filter(module__course__in=courses).count()

    total_duration = Lesson.objects.filter(module__course__in=courses).aggregate(total=Sum("duration_seconds"))["total"] or 0

    total_hours = round(total_duration / 3600, 1)

    return Response({
        "id": professor.id,
        "username": professor.username,
        "email": professor.email,
        "bio": professor.bio,
        "especialidade": "Professor",  
        "stats": {
            "coursesCount": courses.count(),
            "lessons": total_lessons,
            "hours": total_hours
        },
        "courses": CourseSerializer(courses, many=True).data
    })