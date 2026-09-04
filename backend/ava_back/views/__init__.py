from .user_views import UserViewSet, me, professor_by_slug
from .course_views import CourseViewSet, CategoryViewSet, FavoriteViewSet
from .lesson_views import ModuleViewSet, LessonViewSet, LessonMaterialViewSet
from .enrollment_views import EnrollmentViewSet
from .instructor_views import InstructorRequestViewSet
from .auth_views import EmailTokenView

__all__ = [
    'UserViewSet',
    'me',
    'professor_by_slug',
    'CourseViewSet',
    'CategoryViewSet',
    'FavoriteViewSet',
    'ModuleViewSet',
    'LessonViewSet',
    'LessonMaterialViewSet',
    'EnrollmentViewSet',
    'InstructorRequestViewSet',
    'EmailTokenView',
]