from rest_framework import serializers
from .models import ( User, Category, Course, Module, Lesson, LessonMaterial, 
    Enrollment, LessonProgress, AIAssistant, InstructorRequest, 
    Favorite, StudentPerformance, Flashcard, UserFlashcardProgress, 
    Challenge )
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer 
from rest_framework_simplejwt.tokens import RefreshToken 
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Sum

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'role', 'avatar_url', 'bio', 
            'birth_date', 'interests', 'status', 'created_at'
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
        user = User(
            **validated_data,
            role="aluno",
            status="ativo"
        )
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'avatar_url']

class AIAssistantSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAssistant
        fields = ['summary', 'quiz_json', 'generated_at']

class LessonMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonMaterial
        fields = ['id', 'lesson', 'title', 'material_type', 'raw_content', 'file', 'created_at']
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'raw_content': {'required': False, 'allow_blank': True}
        }

    def create(self, validated_data):
        file_obj = validated_data.get('file')
        if file_obj and not validated_data.get('raw_content'):
            validated_data['raw_content'] = file_obj.name
        return super().create(validated_data)

class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = ['id', 'title', 'description', 'evaluation_criteria']

class InstructorLessonSerializer(serializers.ModelSerializer):
    thumbnail = serializers.ImageField(required=False, allow_null=True)
    materials = LessonMaterialSerializer(many=True, read_only=True)
    challenge = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            "id", "module", "title", "slug", "video", "thumbnail", 
            "duration_seconds", "order", "status", "visibility", "materials", "challenge"
        ]

    def get_challenge(self, obj):
        challenge_obj = obj.challenges.first() 
        if not challenge_obj:
            return None
        return ChallengeSerializer(challenge_obj).data

    def create(self, validated_data):
        request = self.context.get('request')
        lesson = super().create(validated_data)
        
        if request:
            has_challenge = request.data.get('has_challenge') == 'true'
            if has_challenge:
                Challenge.objects.create(
                    lesson=lesson,
                    title=request.data.get('challenge_title', ''),
                    description=request.data.get('challenge_description', ''),
                    evaluation_criteria=request.data.get('challenge_criteria', '')
                )
        return lesson

    def update(self, instance, validated_data):
        request = self.context.get('request')
        lesson = super().update(instance, validated_data)
        
        if request:
            has_challenge = request.data.get('has_challenge') == 'true'
            if has_challenge:
                Challenge.objects.update_or_create(
                    lesson=lesson,
                    defaults={
                        'title': request.data.get('challenge_title', ''),
                        'description': request.data.get('challenge_description', ''),
                        'evaluation_criteria': request.data.get('challenge_criteria', ''),
                    }
                )
            else:
                Challenge.objects.filter(lesson=lesson).delete()
        
        lesson.refresh_from_db()
        return lesson
    
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

class LessonSerializer(serializers.ModelSerializer):
    thumbnail = serializers.ImageField(required=False, allow_null=True)
    materials = LessonMaterialSerializer(many=True, read_only=True)
    challenge = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            "id", "module", "title", "slug", "video", "thumbnail", 
            "duration_seconds", "order", "status", "visibility", "materials", "challenge"
        ]

    def get_challenge(self, obj):
        challenge_obj = obj.challenges.first()
        if not challenge_obj:
            return None
        return ChallengeSerializer(challenge_obj).data

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

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'order', 'lessons'] 

class ModuleDetailSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    class Meta:
        model = Module
        fields = ['id', 'title', 'order', 'lessons']

class InstructorModuleSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ["id", "title", "order", "lessons"]

    def get_lessons(self, obj):
        lessons = obj.lessons.all().order_by('order') 
        return InstructorLessonSerializer(lessons, many=True, context=self.context).data

class CourseSerializer(serializers.ModelSerializer):
    professor_name = serializers.CharField(source='professor.username', read_only=True)
    thumbnail = serializers.ImageField(required=False)
    hours = serializers.SerializerMethodField()
    modules = ModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'category', 'professor_name', 
            'price', 'thumbnail', 'published', 'created_at', 'hours', 'modules'
        ]

    def get_hours(self, obj):
        total_seconds = Lesson.objects.filter(module__course=obj).aggregate(total=Sum('duration_seconds'))['total'] or 0
        return round(total_seconds / 3600, 1)

class CourseDetailSerializer(serializers.ModelSerializer):
    modules = ModuleDetailSerializer(many=True, read_only=True)
    professor_name = serializers.CharField(source='professor.username', read_only=True)
    thumbnail = serializers.ImageField(required=False)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'professor_name', 'price', 'thumbnail', 'published', 'created_at', 'modules']

class InstructorCourseSerializer(serializers.ModelSerializer):
    modules = serializers.SerializerMethodField()
    alunos = serializers.SerializerMethodField()
    thumbnail = serializers.ImageField(required=False)

    class Meta:
        model = Course
        fields = ["id", "title", "description", "category", "price", "published", "thumbnail", "alunos", "modules"]
    
    def get_modules(self, obj):
        modules = obj.modules.all().order_by('order')
        return InstructorModuleSerializer(modules, many=True, context=self.context).data

    def get_alunos(self, obj):
        return Enrollment.objects.filter(course=obj, is_active=True).count()

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
            raise serializers.ValidationError("Sua conta foi desativada.")

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
        fields = ["id", "user", "especialidade", "bio", "linkedin", "portfolio", "arquivo", "status", "created_at"]
        read_only_fields = ["user", "status"]

class FavoriteSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='course.title', read_only=True)
    author = serializers.CharField(source='course.professor.username', read_only=True)
    hours = serializers.SerializerMethodField()

    class Meta:
        model = Favorite
        fields = ['id', 'course', 'title', 'author', 'hours']

    def get_hours(self, obj):
        total_seconds = Lesson.objects.filter(module__course=obj.course).aggregate(total=Sum('duration_seconds'))['total'] or 0
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

class QuizSubmissionSerializer(serializers.Serializer):
    score_percentage = serializers.FloatField(min_value=0.0, max_value=100.0)
    weak_topics = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        default=list
    )
    strong_topics = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        default=list
    )

class FlashcardSerializer(serializers.ModelSerializer):
    back = serializers.CharField(source='back_main', read_only=True)
    pergunta = serializers.CharField(source='front', read_only=True)
    resposta = serializers.CharField(source='back_main', read_only=True)

    class Meta:
        model = Flashcard
        fields = [ 'id', 'lesson', 'front', 'back_main', 'back_analogy', 'back', 
            'pergunta', 'resposta', 'created_at' ]
        read_only_fields = ['id', 'created_at']

class UserFlashcardProgressSerializer(serializers.ModelSerializer):
    flashcard = FlashcardSerializer(read_only=True)

    class Meta:
        model = UserFlashcardProgress
        fields = ['id', 'flashcard', 'status', 'interval_days', 'next_review', 'last_reviewed_at']
        read_only_fields = ['id', 'next_review', 'last_reviewed_at']

class FlashcardAnswerSerializer(serializers.Serializer):
    FEEDBACK_CHOICES = (
        ('errei', 'Errei / Difícil'),
        ('medio', 'Médio / Bom'),
        ('facil', 'Fácil'),
    )

    feedback = serializers.ChoiceField(choices=FEEDBACK_CHOICES)