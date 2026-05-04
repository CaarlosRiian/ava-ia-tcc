from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, UserViewSet, CategoryViewSet, ModuleViewSet, LessonViewSet, EnrollmentViewSet, generate_ai, InstructorRequestViewSet, EmailTokenView, me

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'modules', ModuleViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'instructor-requests', InstructorRequestViewSet)

urlpatterns = [
    path('ai/generate/<int:lesson_id>/', generate_ai),
    path('me/', me),  
]

urlpatterns += router.urls