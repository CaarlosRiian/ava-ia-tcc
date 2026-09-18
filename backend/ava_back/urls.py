from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ( CourseViewSet, UserViewSet, CategoryViewSet, ModuleViewSet, 
    LessonViewSet, EnrollmentViewSet, InstructorRequestViewSet, 
    EmailTokenView, me, professor_by_slug, FavoriteViewSet, 
    LessonMaterialViewSet, FlashcardViewSet )

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
router.register(r'flashcards', FlashcardViewSet, basename='flashcard') 

urlpatterns = [
    path('professor/<slug:slug>/', professor_by_slug),
    path('me/', me),  
]

urlpatterns += router.urls