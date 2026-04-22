from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, UserViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)

urlpatterns = router.urls