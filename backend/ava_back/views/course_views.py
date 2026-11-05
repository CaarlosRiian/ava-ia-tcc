from django.db.models import Prefetch
from django.http import HttpResponse, request
from django_filters.rest_framework import DjangoFilterBackend

from ava_back.serializers.interaction import WishlistSerializer
from ava_back.serializers import user
from core import settings
from rest_framework import filters, status
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from ..models import Course, Category, Module, Lesson, Enrollment, LessonProgress, Wishlist, StudentChallengeSubmission
from ..serializers import ( CourseSerializer, CategorySerializer, CourseDetailSerializer, 
    InstructorCourseSerializer )
from ..services import LessonService, CourseService 

class CategoryViewSet(ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def list(self, request, *args, **kwargs):
        if request.query_params.get('all') == 'true':
            queryset = Category.objects.all()
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        
        return super().list(request, *args, **kwargs)

class CourseViewSet(ModelViewSet):
    serializer_class = CourseSerializer
    queryset = Course.objects.prefetch_related('categories', 'modules', 'professor').all()
    
    permission_classes = [IsAuthenticatedOrReadOnly]

    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]   
    
    search_fields = ['title', 'categories__name']
    filterset_fields = ['categories']

    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return CourseDetailSerializer
        return CourseSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            qs = Course.objects.select_related('professor').prefetch_related('categories')
        else:
            qs = Course.objects.filter(published=True).select_related('professor').prefetch_related('categories')

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
        
        course = serializer.save(professor=self.request.user, published=True)
        
        Enrollment.objects.get_or_create(
            user=self.request.user,
            course=course
        )

    def calculate_progress(self, user, course):
        lessons = Lesson.objects.filter(module__course=course)
        total_lessons = lessons.count()
        if not total_lessons:
            return 0.0

        completed_lessons = LessonProgress.objects.filter(
            user=user,
            lesson__in=lessons,
            completed=True
        ).count()

        percentage = (completed_lessons / total_lessons) * 100
        return round(percentage, 2)
        

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
                thumb_str = str(course.thumbnail)
                if thumb_str.startswith("http://") or thumb_str.startswith("https://"):
                    thumbnail = thumb_str
                else:
                    supabase_url = getattr(settings, 'SUPABASE_URL', '')
                    bucket = "course-thumbnails"
                    if supabase_url:
                        thumbnail = f"{supabase_url}/storage/v1/object/public/{bucket}/{thumb_str}"
                    else:
                        thumbnail = thumb_str

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
            'professor'
        ).prefetch_related(
            'categories',
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
        
        if course.professor == request.user:
            return Response(
                {"error": "Professores não podem emitir certificados para os seus próprios cursos."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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

    def list(self, request, *args, **kwargs):
        if request.query_params.get('all') == 'true':
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        
        return super().list(request, *args, **kwargs)

class WishListViewSet(ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(
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

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {"error": "Curso não encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        if course.professor == request.user:
            return Response(
                {"error": "Você é o instrutor deste curso e não pode adicioná-lo à sua Lista de Desejos."},
                status=status.HTTP_400_BAD_REQUEST
            )

        wishlist_item = Wishlist.objects.filter(
            user=request.user,
            course_id=course_id
        ).first()

        if wishlist_item:
            wishlist_item.delete()
            return Response({"in_wishlist": False}, status=status.HTTP_200_OK)

        Wishlist.objects.create(
            user=request.user,
            course=course
        )

        return Response({"in_wishlist": True}, status=status.HTTP_201_CREATED)