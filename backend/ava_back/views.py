from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Prefetch

from rest_framework import filters
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import User, Course, Category, Module, Lesson
from .serializers import CourseSerializer, UserSerializer, CategorySerializer, CourseDetailSerializer, ModuleSerializer, LessonSerializer

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
    # queryset = Course.objects.filter(published=True)
    queryset = Course.objects.all()

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
            Prefetch('modules',queryset=Module.objects.prefetch_related('lessons')
            )
        )
        return super().get_queryset()

    def perform_create(self, serializer):
        serializer.save(professor=self.request.User)

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