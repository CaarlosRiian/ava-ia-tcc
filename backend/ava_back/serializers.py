from rest_framework import serializers
from .models import User, Category, Course, Module, Lesson, Enrollment, LessonProgress

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'avatar_url', 'bio', 'status', 'created_at']
        extra_kwargs = {
            'password': {'write_only': True},
            'created_at': {'read_only': True},
            'status': {'read_only': True},
        }

    def create(self, validated_data):
        validated_data['role'] = 'aluno'
        validated_data['status'] = 'ativo'
        user = User.objects.create_user(**validated_data)
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'avatar_url']

class CourseSerializer(serializers.ModelSerializer):
    professor_name = serializers.CharField(source='professor.username', read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'professor_name', 'price', 'thumbnail_url', 'published', 'created_at']

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'order']

class LessonSerializer(serializers.ModelSerializer):
    module = serializers.PrimaryKeyRelatedField(queryset=Module.objects.all())
    module_title = serializers.CharField(source='module.title', read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'module', 'module_title', 'title', 'slug', 'video_url', 'duration_seconds', 'order']

class ModuleDetailSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    class Meta:
        model = Module
        fields = ['id', 'title', 'order', 'lessons']

class CourseDetailSerializer(serializers.ModelSerializer):
    modules = ModuleDetailSerializer(many=True, read_only=True)
    professor_name = serializers.CharField(source='professor.username', read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'professor_name', 'price', 'thumbnail_url', 'published', 'created_at', 'modules']

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'enrolled_at', 'is_active']
        read_only_fields = ['enrolled_at']

class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ['id', 'lesson', 'completed', 'last_watched']
        read_only_fields = ['last_watched']