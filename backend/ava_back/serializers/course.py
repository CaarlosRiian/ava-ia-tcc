from rest_framework import serializers
from django.db.models import Sum
from ..models import Category, Course, Enrollment, Lesson
from .lesson import ModuleSerializer, ModuleDetailSerializer, InstructorModuleSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'avatar_url']

class CourseSerializer(serializers.ModelSerializer):
    professor_name = serializers.CharField(source='professor.username', read_only=True)
    thumbnail = serializers.ImageField(required=False)
    hours = serializers.SerializerMethodField()
    modules = ModuleSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(many=True, queryset=Category.objects.all(), source='categories', write_only=True, required=False)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'categories', 'category_ids', 'professor_name', 'price', 'thumbnail', 'published', 'created_at', 'hours', 'modules', 'learning_objectives']
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
    thumbnail = serializers.ImageField(required=False)
    learning_objectives = serializers.ListField(child=serializers.CharField(), required=False)
    categories = CategorySerializer(many=True, read_only=True)
    hours = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'categories', 'professor_name', 'price', 'thumbnail', 'published', 'created_at', 'hours', 'modules', 'learning_objectives']
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
    thumbnail = serializers.ImageField(required=False)
    learning_objectives = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = Course
        fields = ["id", "title", "description", "categories", "price", "published", "thumbnail", "alunos", "modules", "learning_objectives"]
    
    def get_modules(self, obj):
        modules = obj.modules.all().order_by('order')
        return InstructorModuleSerializer(modules, many=True, context=self.context).data

    def get_alunos(self, obj):
        return Enrollment.objects.filter(course=obj, is_active=True).exclude(user=obj.professor).count()

class CourseSimpleSerializer(serializers.ModelSerializer):
    thumbnail = serializers.SerializerMethodField()
    lessons_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'thumbnail', 'price', 'category', 'lessons_count']

    def get_thumbnail(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.thumbnail.url)
            return f"http://localhost:8000{obj.thumbnail.url}"
        return None

    def get_lessons_count(self, obj):
        return sum(module.lessons.count() for module in obj.modules.all())

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'enrolled_at', 'is_active']
        read_only_fields = ['enrolled_at']