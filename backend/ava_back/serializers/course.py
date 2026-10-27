from rest_framework import serializers
from django.db.models import Sum
from django.conf import settings
from ..models import Category, Course, Enrollment, Lesson, LessonProgress
from .lesson import ModuleSerializer, ModuleDetailSerializer, InstructorModuleSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'avatar_url']

class CourseSerializer(serializers.ModelSerializer):
    professor_name = serializers.CharField(source='professor.username', read_only=True)
    thumbnail = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    intro_video = serializers.CharField(required=False, allow_blank=True, allow_null=True) 
    hours = serializers.SerializerMethodField()
    modules = ModuleSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(many=True, queryset=Category.objects.all(), source='categories', write_only=True, required=False)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'categories', 'category_ids', 'professor_name', 'price', 'thumbnail', 'intro_video', 'published', 'created_at', 'hours', 'modules', 'learning_objectives']
        read_only_fields = ['id', 'created_at', 'slug']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        categories = instance.categories.all()
        representation['categories'] = CategorySerializer(categories, many=True).data
        return representation

    def get_hours(self, obj):
        total_seconds = Lesson.objects.filter(module__course=obj).aggregate(total=Sum('duration_seconds'))['total'] or 0
        return round(total_seconds / 3600, 1)

class CourseDetailSerializer(serializers.ModelSerializer):
    modules = ModuleDetailSerializer(many=True, read_only=True)
    professor_name = serializers.CharField(source='professor.username', read_only=True)
    professor_avatar = serializers.CharField(source='professor.avatar_url', read_only=True) 
    thumbnail = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    intro_video = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    learning_objectives = serializers.ListField(child=serializers.CharField(), required=False)
    categories = CategorySerializer(many=True, read_only=True)
    hours = serializers.SerializerMethodField()
    professor_slug = serializers.CharField(source='professor.slug', read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'categories', 'professor_name', 
            'professor_avatar', 'professor_slug', 'price', 'thumbnail', 'intro_video', 
            'published', 'created_at', 'hours', 'modules', 'learning_objectives'
        ]
        read_only_fields = ['id', 'created_at', 'slug']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        categories = instance.categories.all()
        representation['categories'] = CategorySerializer(categories, many=True).data
        return representation

    def get_hours(self, obj):
        total_seconds = Lesson.objects.filter(module__course=obj).aggregate(total=Sum('duration_seconds'))['total'] or 0
        return round(total_seconds / 3600, 1)

class InstructorCourseSerializer(serializers.ModelSerializer):
    modules = serializers.SerializerMethodField()
    alunos = serializers.SerializerMethodField()
    thumbnail = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    intro_video = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    learning_objectives = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = Course
        fields = ["id", "title", "description", "categories", "price", "published", "thumbnail", "intro_video", "alunos", "modules", "learning_objectives"]
    
    def get_modules(self, obj):
        modules = obj.modules.all().order_by('order')
        return InstructorModuleSerializer(modules, many=True, context=self.context).data

    def get_alunos(self, obj):
        return Enrollment.objects.filter(course=obj, is_active=True).exclude(user=obj.professor).count()

class CourseSimpleSerializer(serializers.ModelSerializer):
    thumbnail = serializers.SerializerMethodField()
    lessons_count = serializers.SerializerMethodField()
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'thumbnail', 'price', 'categories', 'lessons_count']

    def get_thumbnail(self, obj):
        if obj.thumbnail:
            thumb_str = str(obj.thumbnail)
            if thumb_str.startswith("http://") or thumb_str.startswith("https://"):
                return thumb_str
            
            supabase_url = getattr(settings, 'SUPABASE_URL', '')
            bucket = "course-thumbnails" 
            if supabase_url:
                return f"{supabase_url}/storage/v1/object/public/{bucket}/{thumb_str}"
            return thumb_str
        return None

    def get_lessons_count(self, obj):
        return sum(module.lessons.count() for module in obj.modules.all())

class EnrollmentSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    course_id = serializers.ReadOnlyField(source='course.id')
    title = serializers.ReadOnlyField(source='course.title')
    thumbnail = serializers.ImageField(source='course.thumbnail', read_only=True)
    professor = serializers.ReadOnlyField(source='course.professor.username')

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'course_id', 'title', 'thumbnail', 'professor', 'progress', 'enrolled_at', 'is_active']
        read_only_fields = ['enrolled_at']

    def get_progress(self, obj):
        user = obj.user
        course = obj.course

        total_lessons = Lesson.objects.filter(module__course=course).count()
        if total_lessons == 0:
            return 0.0

        completed_lessons = LessonProgress.objects.filter(
            user=user,
            lesson__module__course=course,
            completed=True
        ).count()

        percentage = (completed_lessons / total_lessons) * 100
        return round(percentage, 1)