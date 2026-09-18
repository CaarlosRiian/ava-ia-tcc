import uuid

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify
from django.conf import settings

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
    birth_date = models.DateField(null=True, blank=True)
    interests = models.JSONField(default=list, blank=True)

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

    @property
    def age(self):
        if not self.birth_date:
            return None
        from datetime import date
        today = date.today()
        return today.year - self.birth_date.year - (
                (today.month, today.day) < (self.birth_date.month, self.birth_date.day)
            )
    
    def __str__(self):
        return self.username

class Category(models.Model):
    name = models.CharField(max_length=100)
    avatar_url = models.ImageField(upload_to='categories/', null=True, blank=True)

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

    min_age = models.PositiveIntegerField(default=0)     
    max_age = models.PositiveIntegerField(default=100)   
    target_area = models.CharField(max_length=100, blank=True, null=True)

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

    VISIBILITY_CHOICES = (
        ('publico', 'Público'),
        ('privado', 'Privado'),
    )

    module = models.ForeignKey('Module', on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    video = models.FileField(upload_to='videos/', blank=True, null=True)
    duration_seconds = models.IntegerField(default=0)
    order = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES,default='rascunho')
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='privado')
    thumbnail = models.ImageField(upload_to='lesson_thumbnails/', blank=True, null=True)

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
    
class LessonMaterial(models.Model):
    MATERIAL_TYPES = [
        ('text', 'Texto Escrito'),
        ('pdf', 'Documento PDF/Arquivo'),
        ('link', 'Link Externo/Vídeo'),
    ]

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=255, verbose_name="Nome do Material")
    material_type = models.CharField(max_length=10, choices=MATERIAL_TYPES)
    
    raw_content = models.TextField(blank=True, null=True, verbose_name="Conteúdo de Texto ou URL")
    
    file = models.FileField(upload_to='lesson_materials/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.get_material_type_display()})"

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

class StudentPerformance(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    lesson = models.ForeignKey('Lesson', on_delete=models.CASCADE)
    score_percentage = models.FloatField(default=0.0) 
    weak_topics = models.JSONField(default=list, blank=True) 
    strong_topics = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - Aula {self.lesson.id} ({self.score_percentage}%)"

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

class Flashcard(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='flashcards')
    front = models.TextField(verbose_name="Frente / Pergunta")
    back_main = models.TextField(verbose_name="Verso / Resposta Principal")
    back_analogy = models.TextField(blank=True, null=True, verbose_name="Verso Alternativo / Analogia")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Flashcard ({self.lesson.title}) - {self.front[:30]}..."


class UserFlashcardProgress(models.Model):
    STATUS_CHOICES = (
        ('novo', 'Novo'),
        ('aprendendo', 'Aprendendo'),
        ('revisado', 'Revisado / Dominado'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='flashcard_progress')
    flashcard = models.ForeignKey(Flashcard, on_delete=models.CASCADE, related_name='user_progress')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='novo')
    interval_days = models.PositiveIntegerField(default=1, verbose_name="Intervalo em Dias")
    next_review = models.DateTimeField(auto_now_add=True, verbose_name="Próxima Revisão")
    last_reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'flashcard')
        indexes = [
            models.Index(fields=['user', 'next_review']),
        ]

    def __str__(self):
        return f"{self.user.username} - Flashcard {self.flashcard.id} (Próxima: {self.next_review.date()})"

class Challenge(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='challenges')
    title = models.CharField(max_length=255)
    description = models.TextField()
    evaluation_criteria = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class LessonChallenge(models.Model):
    TAXONOMY_LEVELS = (
        ('analisar', 'Analisar'),
        ('avaliar', 'Avaliar'),
        ('criar', 'Criar'),
    )

    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='challenge')
    title = models.CharField(max_length=200, verbose_name="Título do Desafio Prático")
    description = models.TextField(verbose_name="Enunciado / Descrição do Problema")
    taxonomy_level = models.CharField(max_length=20, choices=TAXONOMY_LEVELS, default='analisar')
    evaluation_criteria = models.TextField(verbose_name="Critérios de Avaliação para a IA")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Desafio ({self.get_taxonomy_level_display()}) - {self.lesson.title}"


class StudentChallengeSubmission(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='challenge_submissions')
    challenge = models.ForeignKey(LessonChallenge, on_delete=models.CASCADE, related_name='submissions')
    answer_text = models.TextField(verbose_name="Resposta do Aluno")
    
    strengths = models.TextField(blank=True, null=True, verbose_name="Pontos Fortes")
    improvements = models.TextField(blank=True, null=True, verbose_name="O que melhorar")
    review_timestamp = models.CharField(max_length=20, blank=True, null=True, verbose_name="Minuto sugerido para revisão (ex: 04:20)")
    score_percentage = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'challenge')

    def __str__(self):
        return f"{self.student.username} - Desafio: {self.challenge.title} ({self.score_percentage}%)"

class LessonSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lesson = models.ForeignKey('Lesson', on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_submissions')
    
    student_answer = models.TextField()
    
    ai_feedback = models.TextField()
    
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Submissão de Aula"
        verbose_name_plural = "Submissões de Aulas"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student} - {self.lesson.title}"