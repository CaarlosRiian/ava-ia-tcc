from django.contrib import admin
from django.utils.html import format_html
from .models import ( User, Category, Course, Module, Lesson, LessonMaterial, 
    Enrollment, AIAssistant, InstructorRequest, LessonChallenge, LessonSubmission, StudentChallengeSubmission, LessonProgress, Wishlist )

class LessonMaterialInline(admin.StackedInline):
    model = LessonMaterial
    extra = 1
    fields = ('title', 'material_type', 'raw_content', 'file')

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    prepopulated_fields = {'slug': ('title',)}

class ModuleInline(admin.TabularInline):
    model = Module
    extra = 1

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'get_categories', 'professor', 'published', 'created_at')
    list_filter = ('categories', 'published', 'created_at')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('preview_thumbnail',)
    
    filter_horizontal = ('categories',)

    fieldsets = (
        (
            "Informações do Curso",
            {
                "fields": (
                    'title',
                    'slug',
                    'description',
                    'categories',  
                    'price',
                    'professor',
                    'published',
                    'intro_video',        
                    'min_age',
                    'max_age',
                    'target_area',
                    'learning_objectives'
                )
            }
        ),
        (
            "Thumbnail",
            {
                "fields": (
                    'thumbnail',
                    'preview_thumbnail'
                )
            }
        ),
    )

    inlines = [ModuleInline]

    def get_categories(self, obj):
        return ", ".join([c.name for c in obj.categories.all()])
    get_categories.short_description = 'Categorias'

    def preview_thumbnail(self, obj):
        if obj.thumbnail:
            return format_html(
                '<img src="{}" width="200" style="border-radius:10px;" />',
                obj.thumbnail.url
            )
        return "Sem imagem"

    preview_thumbnail.short_description = "Preview"

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    inlines = [LessonInline]

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'status', 'visibility', 'order')
    list_filter = ('status', 'visibility', 'module__course')
    search_fields = ('title', 'slug')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [LessonMaterialInline]  

@admin.register(LessonMaterial)
class LessonMaterialAdmin(admin.ModelAdmin):
    list_display = ('title', 'lesson', 'material_type', 'created_at')
    list_filter = ('material_type', 'created_at')
    search_fields = ('title', 'raw_content', 'lesson__title')

admin.site.register(User)
admin.site.register(Category)

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'enrolled_at', 'is_active')
    list_filter = ('course', 'is_active')

@admin.register(AIAssistant)
class AIAssistantAdmin(admin.ModelAdmin):
    list_display = ('lesson', 'generated_at')

@admin.register(InstructorRequest)
class InstructorRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "especialidade",
        "status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("especialidade", "bio", "user__username")

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'course', 'created_at')
    search_fields = ('user__username', 'course__title')
    list_filter = ('created_at',)

@admin.register(LessonChallenge)
class LessonChallengeAdmin(admin.ModelAdmin):
    list_display = ('id', 'lesson', 'title', 'created_at')
    search_fields = ('title', 'lesson__title')

@admin.register(LessonSubmission)
class LessonSubmissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'lesson', 'created_at', 'grade')  
    list_filter = ('created_at', 'lesson')
    search_fields = ('student__username', 'student__email', 'lesson__title', 'student_answer')

@admin.register(StudentChallengeSubmission)
class StudentChallengeSubmissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'challenge', 'score_percentage', 'created_at')
    list_filter = ('created_at', 'score_percentage')
    search_fields = ('student__username', 'student__email', 'challenge__title', 'answer_text')

@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'lesson', 'completed')
    list_filter = ('completed',)
    search_fields = ('user__username', 'lesson__title')