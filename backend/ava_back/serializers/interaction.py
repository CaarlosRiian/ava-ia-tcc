from core import settings
from rest_framework import serializers
from django.db.models import Sum
from ..models import AIAssistant, CourseReview, StudentChallengeSubmission, LessonComment, Wishlist, Lesson

class AIAssistantSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAssistant
        fields = ['summary', 'quiz_json', 'generated_at']

class WishlistSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='course.title', read_only=True)
    author = serializers.CharField(source='course.professor.username', read_only=True)
    price = serializers.DecimalField(source='course.price', max_digits=8, decimal_places=2, read_only=True)
    hours = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    lessons_count = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ['id', 'course', 'title', 'author', 'price', 'hours', 'thumbnail', 'lessons_count']

    def get_hours(self, obj):
        total_seconds = Lesson.objects.filter(module__course=obj.course).aggregate(
            total=Sum('duration_seconds')
        )['total'] or 0
        return round(total_seconds / 3600, 1)

    def get_thumbnail(self, obj):
        if obj.course and obj.course.thumbnail:
            thumb_str = str(obj.course.thumbnail)
            if thumb_str.startswith("http://") or thumb_str.startswith("https://"):
                return thumb_str
            
            supabase_url = getattr(settings, 'SUPABASE_URL', '')
            bucket = "course-thumbnails"
            if supabase_url:
                return f"{supabase_url}/storage/v1/object/public/{bucket}/{thumb_str}"
            return thumb_str
        return None

    def get_lessons_count(self, obj): 
        return Lesson.objects.filter(module__course=obj.course).count()

class QuizSubmissionSerializer(serializers.Serializer):
    score_percentage = serializers.FloatField(min_value=0.0, max_value=100.0)
    weak_topics = serializers.ListField(child=serializers.CharField(max_length=100), required=False, default=list)
    strong_topics = serializers.ListField(child=serializers.CharField(max_length=100), required=False, default=list)

class CourseReviewSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    user_id = serializers.ReadOnlyField(source='user.id')
    instructor_reply = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = CourseReview
        fields = ['id', 'user', 'user_id', 'username', 'course', 'rating', 'comment', 'instructor_reply', 'created_at']
        read_only_fields = ['id', 'user', 'user_id', 'created_at']

    def validate(self, data):
        request = self.context.get('request')
        course = data.get('course')
        if request and request.user and course:
            user_id = request.user.id
            instructor_id = getattr(course, 'instructor_id', None) or getattr(getattr(course, 'instructor', None), 'id', None)
            created_by_id = getattr(course, 'created_by_id', None) or getattr(getattr(course, 'created_by', None), 'id', None)
            if user_id in [instructor_id, created_by_id]:
                raise serializers.ValidationError("Como instrutor, você não pode avaliar o seu próprio curso.")
        return data

class StudentChallengeSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    challenge_title = serializers.CharField(source='challenge.title', read_only=True)

    class Meta:
        model = StudentChallengeSubmission
        fields = ['id', 'student', 'student_name', 'challenge', 'challenge_title', 'answer_text', 'strengths', 'improvements', 'review_timestamp', 'score_percentage', 'created_at']
        read_only_fields = ['id', 'created_at']

class LessonCommentSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    user_name = serializers.ReadOnlyField(source='user.first_name')
    user_avatar = serializers.ReadOnlyField(source='user.avatar_url')
    replies = serializers.SerializerMethodField()

    class Meta:
        model = LessonComment
        fields = ['id', 'lesson', 'user', 'user_name', 'user_avatar', 'parent', 'content', 'created_at', 'replies'] 
        read_only_fields = ['lesson', 'user', 'created_at', 'replies']

    def get_replies(self, obj):
        if obj.replies.exists():
            return LessonCommentSerializer(obj.replies.all().order_by('created_at'), many=True).data
        return []