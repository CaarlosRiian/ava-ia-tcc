from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, UserViewSet, CategoryViewSet, ModuleViewSet, LessonViewSet, EnrollmentViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'modules', ModuleViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'enrollments', EnrollmentViewSet)

urlpatterns = router.urls