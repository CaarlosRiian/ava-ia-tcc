from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, UserViewSet, CategoryViewSet, ModuleViewSet, LessonViewSet, EnrollmentViewSet, generate_ai, InstructorRequestViewSet, EmailTokenView, me, professor_by_slug, FavoriteViewSet, LessonMaterialViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'modules', ModuleViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'materials', LessonMaterialViewSet, basename='lesson-material')
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'instructor-requests', InstructorRequestViewSet)
router.register(r'favorites', FavoriteViewSet, basename='favorites')

urlpatterns = [
    path('ai/generate/<int:lesson_id>/', generate_ai),
    path('professor/<slug:slug>/', professor_by_slug),
    path('me/', me),  
]

urlpatterns += router.urls