from rest_framework import serializers
from .models import User, Category, Course, Module, Lesson, Enrollment, LessonProgress, AIAssistant, InstructorRequest, Favorite
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer 
from rest_framework_simplejwt.tokens import RefreshToken 
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Sum

User = get_user_model()

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

class AIAssistantSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAssistant
        fields = ['summary', 'quiz_json', 'generated_at']

class LessonSerializer(serializers.ModelSerializer):
    module_title = serializers.CharField(source='module.title', read_only=True)
    ai_content = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'module', 'module_title', 'title', 'slug', 'video_url', 'duration_seconds', 'order', 'ai_content']

    def get_ai_content(self, obj):
        ai = AIAssistant.objects.filter(lesson=obj).first()

        if not ai:
            return None

        return {
            "summary": ai.summary,
            "quiz_json": ai.quiz_json,
            "generated_at": ai.generated_at
        }


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

class EmailTokenSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Credenciais inválidas")

        if not user.check_password(password):
            raise serializers.ValidationError("Credenciais inválidas")

        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

class InstructorRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "name": obj.user.username,
            "email": obj.user.email,
        }

    class Meta:
        model = InstructorRequest
        fields = [ "id", "user", "especialidade", "bio", "linkedin", "portfolio", "arquivo", "status", "created_at",]

        read_only_fields = ["user", "status"]

class FavoriteSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='course.title', read_only=True)
    author = serializers.CharField(source='course.professor.username', read_only=True)
    hours = serializers.SerializerMethodField()

    class Meta:
        model = Favorite
        fields = ['id', 'course', 'title', 'author', 'hours']

    def get_hours(self, obj):
        total_seconds = Lesson.objects.filter(
            module__course=obj.course
        ).aggregate(
            total=Sum('duration_seconds')
        )['total'] or 0

        return round(total_seconds / 3600, 1)