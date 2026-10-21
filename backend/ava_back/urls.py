from django.urls import path, include, re_path
from ava_back.views.lesson_views import CourseReviewListCreateView, CourseReviewDetailView
from rest_framework.routers import DefaultRouter
from .views import ( CourseViewSet, UserViewSet, CategoryViewSet, ModuleViewSet, 
    LessonViewSet, EnrollmentViewSet, InstructorRequestViewSet, 
    EmailTokenView, me, WishListViewSet, 
    LessonMaterialViewSet)
from ava_back.views.instructor_views import ProfessorDetailView

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'modules', ModuleViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'materials', LessonMaterialViewSet, basename='lesson-material')
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'instructor-requests', InstructorRequestViewSet, basename='instructor-requests')
router.register(r'wishlist', WishListViewSet, basename='wishlist')

urlpatterns = [
    path('me/', me),  
    path('courses/<int:course_id>/reviews/', CourseReviewListCreateView.as_view(), name='course-review-list-create'),
    path('courses/reviews/<int:pk>/', CourseReviewDetailView.as_view(), name='course-review-detail'),
    re_path(r'^professor/(?P<name>.+)/?$', ProfessorDetailView.as_view(), name='professor-detail'),
]

urlpatterns += router.urls