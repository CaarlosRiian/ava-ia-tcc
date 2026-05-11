from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify

class User(AbstractUser):
    STATUS_CHOICES = (
        ('ativo', 'Ativo'),
        ('banido', 'Banido'),
    )

    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('professor', 'Professor'),
        ('aluno', 'Aluno'),
    )
    slug = models.SlugField(unique=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='aluno')
    avatar_url = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ativo')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.username)
            slug = base_slug
            count = 1

            while User.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{count}"
                count += 1

            self.slug = slug

        super().save(*args, **kwargs)

class Category(models.Model):
    name = models.CharField(max_length=100)
    avatar_url = models.URLField()

    def __str__(self):
        return self.name

class Course(models.Model):
    title = models.CharField(max_length=100, null=False, blank=False)
    slug = models.SlugField(unique=True, null=False, blank=False)
    description = models.TextField()
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    thumbnail = models.ImageField(upload_to="courses/", null=True, blank=True)
    professor = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name='courses',
        limit_choices_to={'role': 'professor'}
    )
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            count = 1

            while Course.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{count}"
                count += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=100, null=False, blank=False)
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

class Lesson(models.Model):
    STATUS_CHOICES = (
        ('publicada', 'Publicada'),
        ('rascunho', 'Rascunho'),
    )

    module = models.ForeignKey('Module', on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    video = models.FileField(upload_to='videos/', blank=True, null=True)
    duration_seconds = models.IntegerField(default=0)
    order = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES,default='rascunho')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            count = 1

            while Lesson.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{count}"
                count += 1

            self.slug = slug

        if self.order == 0:
            last_order = Lesson.objects.filter(
                module=self.module
            ).count()
            self.order = last_order + 1

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Enrollment(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey('Course', on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f'{self.user.username} - {self.course.title}'

class LessonProgress(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey('Lesson', on_delete=models.CASCADE, related_name='progress')
    completed = models.BooleanField(default=False)
    last_watched = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'lesson')

    def __str__(self):
        return f'{self.user.username} - {self.lesson.title} - {self.completed}'

class AIAssistant(models.Model):
    lesson = models.OneToOneField('Lesson', on_delete=models.CASCADE, related_name='ai_assistant')
    summary = models.TextField(blank=True, null=True)
    quiz_json = models.JSONField(blank=True, null=True)
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'IA - {self.lesson.title}'

class InstructorRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pendente'),
        ('approved', 'Aprovado'),
        ('rejected', 'Rejeitado'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    especialidade = models.CharField(max_length=100)
    bio = models.TextField()
    linkedin = models.URLField(blank=True, null=True)
    portfolio = models.URLField(blank=True, null=True)
    arquivo = models.FileField(upload_to='instructor_requests/', null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f'{self.user.username} - {self.course.title}'