from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import User, Course, Category
from .serializers import CourseSerializer, UserSerializer, CategorySerializer

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

    def perform_create(self, serializer):
        serializer.save(professor=User.objects.first())
