from django.contrib import admin
from .models import User, Category, Course, Module, Lesson, Enrollment, AIAssistant, InstructorRequest, Favorite

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    prepopulated_fields = {'slug': ('title',)}

class ModuleInline(admin.TabularInline):
    model = Module
    extra = 1

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'professor', 'published', 'created_at')
    list_filter = ('category', 'published', 'created_at')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ModuleInline]

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    inlines = [LessonInline]

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

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'course', 'created_at')
    search_fields = ('user__username', 'course__title')
    list_filter = ('created_at',)