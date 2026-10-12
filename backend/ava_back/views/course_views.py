from django.db.models import Prefetch
from django.http import HttpResponse, request
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters, status
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from ..models import Course, Category, Module, Lesson, Enrollment, LessonProgress, Favorite, StudentChallengeSubmission
from ..serializers import ( CourseSerializer, CategorySerializer, CourseDetailSerializer, 
    InstructorCourseSerializer, FavoriteSerializer )
from ..services.service import LessonService, CourseService 

class CategoryViewSet(ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class CourseViewSet(ModelViewSet):
    serializer_class = CourseSerializer
    queryset = Course.objects.all()
    
    permission_classes = [IsAuthenticatedOrReadOnly]

    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['title', 'category__name']
    filterset_fields = ['category']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            qs = Course.objects.select_related('professor', 'category')
        else:
            qs = Course.objects.filter(published=True).select_related('professor', 'category')

        if self.action in ['retrieve', 'instructor_dashboard']:
            qs = qs.prefetch_related(
                Prefetch(
                    'modules',
                    queryset=Module.objects.prefetch_related('lessons')
                )
            )
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={"request": request})
        return Response(serializer.data)

    def perform_create(self, serializer):
        if self.request.user.role != "professor":
            raise PermissionDenied("Apenas professores podem criar cursos")
        serializer.save(professor=self.request.user)

    def calculate_progress(self, user, course):
        lessons = Lesson.objects.filter(module__course=course)
        total_lessons = lessons.count()
        if not total_lessons:
            return 0.0

        total_accumulated_progress = 0.0

        for lesson in lessons:
            lesson_progress_score = 0.0
            
            video_completed = LessonProgress.objects.filter(
                user=user,
                lesson=lesson,
                completed=True
            ).exists()
            
            if video_completed:
                lesson_progress_score += 70.0  
            
            from ..models import LessonChallenge, StudentChallengeSubmission
            challenge = LessonChallenge.objects.filter(lesson=lesson).first()
            
            if challenge:
                passed_challenge = StudentChallengeSubmission.objects.filter(
                    student=user,
                    challenge=challenge,
                    score_percentage__gte=70.0
                ).exists()
                
                if passed_challenge:
                    lesson_progress_score += 30.0 
            else:
                lesson_progress_score += 30.0

            total_accumulated_progress += lesson_progress_score

        course_progress = total_accumulated_progress / total_lessons
        return round(course_progress, 2)
        

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_courses(self, request):
        user = request.user
        enrollments = Enrollment.objects.select_related(
            'course',
            'course__professor'
        ).filter(
            user=user,
            is_active=True
        )

        data = []
        for enrollment in enrollments:
            course = enrollment.course
            thumbnail = None
            if course.thumbnail:
                try:
                    thumbnail = request.build_absolute_uri(course.thumbnail.url)
                except Exception:
                    thumbnail = None

            data.append({
                "course_id": course.id,
                "title": course.title,
                "thumbnail": thumbnail,
                "professor": course.professor.username,
                "progress": self.calculate_progress(user, course)
            })

        return Response(data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def progress(self, request, pk=None):
        course = self.get_object()
        user = request.user

        total_lessons = Lesson.objects.filter(module__course=course).count()
        
        progress_percentage = self.calculate_progress(user, course)
        
        completed_lessons = int((progress_percentage / 100) * total_lessons) if total_lessons else 0

        return Response({
            "course": course.title,
            "total_lessons": total_lessons,
            "completed_lessons": completed_lessons,
            "progress": progress_percentage
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def instructor_dashboard(self, request):
        courses = Course.objects.filter(
            professor=request.user
        ).select_related(
            'professor',
            'category'
        ).prefetch_related(
            'modules__lessons'
        )

        serializer = InstructorCourseSerializer(
            courses,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def certificado(self, request, pk=None):
        course = self.get_object()
        
        try:
            html_content = LessonService.gerar_html_certificado(request.user, course)
            return HttpResponse(html_content, content_type="text/html")
        except ValidationError as e:
            error_msg = e.detail[0] if isinstance(e.detail, list) else e.detail
            return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny],   url_path='recommendations')
    def recommendations(self, request):
        if not request.user or not request.user.is_authenticated:
                return Response([], status=status.HTTP_200_OK)
                
        courses = CourseService.get_recommended_courses(request.user)
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class FavoriteViewSet(ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(
            user=self.request.user
        ).select_related(
            'course',
            'course__professor'
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        course_id = request.data.get("course")

        if not course_id:
            return Response(
                {"error": "O campo 'course' é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST
            )

        favorite = Favorite.objects.filter(
            user=request.user,
            course_id=course_id
        ).first()

        if favorite:
            favorite.delete()
            return Response({"favorited": False}, status=status.HTTP_200_OK)

        Favorite.objects.create(
            user=request.user,
            course_id=course_id
        )

        return Response({"favorited": True}, status=status.HTTP_201_CREATED)