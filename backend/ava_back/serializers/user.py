from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Sum
from .course import CourseSimpleSerializer 
from ..models import Enrollment, InstructorRequest, Course, Lesson

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='username', required=False)
    specialties = serializers.JSONField(required=False, allow_null=True)
    primary_specialty = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'name', 'email', 'password', 'role', 'avatar_url', 'bio', 
            'birth_date', 'interests', 'status', 'specialties', 'created_at', 'primary_specialty', 'onboarding_completed'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'created_at': {'read_only': True},
            'status': {'read_only': True},
            'role': {'read_only': True},
        }

    def validate_email(self, value):
        user = self.instance
        if user and user.email == value:
            return value
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está em uso.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data, role="aluno", status="ativo")
        user.set_password(password)
        user.save()
        return user

    def get_primary_specialty(self, obj):
        if hasattr(obj, 'instructor_profile') and obj.instructor_profile.primary_specialty:
            return obj.instructor_profile.primary_specialty.name
        if getattr(obj, 'specialty', None):
            return obj.specialty
        if obj.specialties and len(obj.specialties) > 0:
            return obj.specialties[0]
        return ""

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        
        if 'username' in validated_data:
            instance.username = validated_data.pop('username')
            
        specialties = validated_data.pop("specialties", None)
        if specialties is not None:
            instance.specialties = specialties
            
        avatar_url = validated_data.pop("avatar_url", None)
        if avatar_url is not None:
            instance.avatar_url = avatar_url

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance

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

        if user.status == "banido":
            raise serializers.ValidationError("Sua conta foi desativada.")

        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

class InstructorRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = InstructorRequest
        fields = ["id", "user", "especialidade", "bio", "linkedin", "portfolio", "arquivo", "status", "motivo_rejeicao", "created_at"]
        read_only_fields = ["user", "status"]

class ProfessorProfileSerializer(serializers.ModelSerializer):
    especialidade = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'bio', 'avatar_url', 'especialidade', 'stats', 'courses'] 

    def get_especialidade(self, obj):
        req = InstructorRequest.objects.filter(user=obj, status='aprovado').first()
        return req.especialidade if req else "Tecnologia"

    def get_stats(self, obj):
        courses = Course.objects.filter(professor=obj)
        courses_count = courses.count()
        lessons = Lesson.objects.filter(module__course__in=courses)
        lessons_count = lessons.count()
        total_seconds = lessons.aggregate(total=Sum('duration_seconds'))['total'] or 0
        total_hours = round(total_seconds / 3600, 1)

        return {
            "coursesCount": courses_count,
            "hours": total_hours,
            "lessons": lessons_count
        }


class ProfessorSerializer(serializers.ModelSerializer):
    courses = CourseSimpleSerializer(many=True, read_only=True)
    total_lessons = serializers.SerializerMethodField()
    total_students = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'specialties', 'bio', 'avatar_url', 'courses', 'date_joined', 'total_lessons', 'total_students'] 

    def get_total_lessons(self, obj):
        return sum(module.lessons.count() for course in obj.courses.all() for module in course.modules.all())

    def get_total_students(self, obj):
        return Enrollment.objects.filter(course__professor=obj).count()

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['stats'] = {
            'coursesCount': instance.courses.count(),
            'lessons': self.get_total_lessons(instance),
            'students': self.get_total_students(instance),
        }
        return representation