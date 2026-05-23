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
            'role': {'read_only': True},
        }

    def validate_email(self, value):

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Este email já está em uso."
            )

        return value

    def create(self, validated_data):

        password = validated_data.pop("password")

        user = User(
            **validated_data,
            role="aluno",
            status="ativo"
        )

        user.set_password(password)
        user.save()

        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'avatar_url']

class CourseSerializer(serializers.ModelSerializer):
    professor_name = serializers.CharField(source='professor.username', read_only=True)
    thumbnail = serializers.ImageField(required=False)
    hours = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'professor_name', 'price', 'thumbnail', 'published', 'created_at', 'hours']

    def get_hours(self, obj):
        total_seconds = Lesson.objects.filter(
            module__course=obj
        ).aggregate(
            total=Sum('duration_seconds')
        )['total'] or 0

        return round(total_seconds / 3600, 1)

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
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'module', 'module_title', 'title', 'slug', 'video', 'thumbnail', 'status', 'visibility','duration_seconds', 'order', 'ai_content']

    def get_ai_content(self, obj):
        ai = AIAssistant.objects.filter(lesson=obj).first()

        if not ai:
            return None

        return {
            "summary": ai.summary,
            "quiz_json": ai.quiz_json,
            "generated_at": ai.generated_at
        }
    
    def get_thumbnail(self, obj):
        request = self.context.get('request')

        if obj.thumbnail:
            return request.build_absolute_uri(
                obj.thumbnail.url
            )

        return None

class ModuleDetailSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    class Meta:
        model = Module
        fields = ['id', 'title', 'order', 'lessons']

class CourseDetailSerializer(serializers.ModelSerializer):
    modules = ModuleDetailSerializer(many=True, read_only=True)
    professor_name = serializers.CharField(source='professor.username', read_only=True)

    thumbnail = serializers.ImageField(required=False)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'professor_name', 'price', 'thumbnail', 'published', 'created_at', 'modules']

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

        if user.status == "banido":
            raise serializers.ValidationError(
                "Sua conta foi desativada."
            )

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

class InstructorLessonSerializer(serializers.ModelSerializer):
    thumbnail = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Lesson
        fields = ["id", "module", "title", "slug", "video", "thumbnail", "duration_seconds", "order", "status", "visibility",]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get("request")
        
        if instance.thumbnail and request:
            ret['thumbnail'] = request.build_absolute_uri(instance.thumbnail.url)
        elif instance.thumbnail:
            ret['thumbnail'] = instance.thumbnail.url
        else:
            ret['thumbnail'] = None
            
        return ret

class InstructorModuleSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = [
            "id",
            "title",
            "order",
            "lessons"
        ]

    def get_lessons(self, obj):
        lessons = obj.lessons.all().order_by('order') 
        return InstructorLessonSerializer(lessons, many=True, context=self.context).data

class InstructorCourseSerializer(serializers.ModelSerializer):
    modules = serializers.SerializerMethodField()
    alunos = serializers.SerializerMethodField()
    thumbnail = serializers.ImageField(required=False)

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "category",
            "price",
            "published",
            "thumbnail",
            "alunos",
            "modules"
        ]
    
    def get_modules(self, obj):
        modules = obj.modules.all().order_by('order')
        return InstructorModuleSerializer(modules, many=True, context=self.context).data

    def get_alunos(self, obj):
        return Enrollment.objects.filter(
            course=obj,
            is_active=True
        ).count()

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
    
class ProfessorProfileSerializer(serializers.ModelSerializer):
    especialidade = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'bio', 'especialidade', 'stats', 'courses']

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