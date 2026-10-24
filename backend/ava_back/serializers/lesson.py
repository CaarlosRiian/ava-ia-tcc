from rest_framework import serializers
from ..models import Lesson, LessonMaterial, Challenge, Module, LessonProgress

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

class LessonSerializer(serializers.ModelSerializer):
    materials = LessonMaterialSerializer(many=True, read_only=True)
    challenge = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ["id", "module", "title", "slug", "video", "thumbnail", "duration_seconds", "order", "status", "visibility", "materials", "challenge", "is_completed"]

    def get_challenge(self, obj):
        challenge_obj = obj.challenges.first()
        return ChallengeSerializer(challenge_obj).data if challenge_obj else None

    def get_is_completed(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return LessonProgress.objects.filter(user=request.user, lesson=obj, completed=True).exists()
        return False

class InstructorLessonSerializer(LessonSerializer):
    def create(self, validated_data):
        request = self.context.get('request')
        lesson = super().create(validated_data)
        if request and request.data.get('has_challenge') == 'true':
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