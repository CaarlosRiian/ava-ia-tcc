from django.db.models import Sum
from rest_framework import filters, status
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend

from ..models import User, Course, Lesson
from ..serializers import UserSerializer, CourseSerializer
from ..permissions import IsAdminUserRole


class UsuariosPaginacaoCustomizada(PageNumberPagination):
    page_size = 8  
    page_size_query_param = 'page_size'  
    max_page_size = 100


class UserViewSet(ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    pagination_class = UsuariosPaginacaoCustomizada

    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter
    ]

    search_fields = ['username', 'email']
    filterset_fields = ['role', 'status']
    ordering_fields = ['created_at', 'username']

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAdminUserRole()]

    def get_queryset(self):
        queryset = User.objects.all()
        status_param = self.request.query_params.get("status")

        if status_param and status_param != "todos":
            queryset = queryset.filter(status=status_param)

        role_param = self.request.query_params.get("role")

        if role_param and role_param != "todos":
            queryset = queryset.filter(role=role_param)

        return queryset.order_by("-created_at")

    @action(detail=True, methods=['patch'])
    def change_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get("role")

        if role not in ['admin', 'professor', 'aluno']:
            return Response({"error": "Role inválida"}, status=status.HTTP_400_BAD_REQUEST)

        user.role = role
        user.save()
        return Response({"message": "Role atualizada"})

    @action(detail=True, methods=['patch'])
    def toggle_ban(self, request, pk=None):
        user = self.get_object()
        user.status = "ativo" if user.status == "banido" else "banido"
        user.save()

        return Response({
            "message": "Status atualizado",
            "status": user.status
        })


@api_view(["GET", "PATCH"]) 
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user

    if request.method == "GET":
        return Response({
            "id": user.id,
            "name": user.username,   
            "email": user.email,
            "role": user.role,
            "bio": getattr(user, "bio", "") 
        })

    elif request.method == "PATCH":
        data = request.data
        
        if "name" in data:
            user.username = data["name"] 
        if "email" in data:
            user.email = data["email"]
        if "bio" in data and hasattr(user, "bio"):
            user.bio = data["bio"]
            
        if "password" in data and data["password"]:
            user.set_password(data["password"])

        user.save()

        return Response({
            "id": user.id,
            "name": user.username,   
            "email": user.email,
            "role": user.role,
            "bio": getattr(user, "bio", ""),
            "message": "Perfil atualizado com sucesso!"
        }, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def professor_by_slug(request, slug):
    try:
        professor = User.objects.get(username=slug, role="professor")
    except User.DoesNotExist:
        return Response({"error": "Professor não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    courses = Course.objects.filter(professor=professor)
    published_courses = courses.filter(published=True)

    total_lessons = Lesson.objects.filter(module__course__in=published_courses).count()
    total_duration = Lesson.objects.filter(module__course__in=published_courses).aggregate(total=Sum("duration_seconds"))["total"] or 0
    total_hours = round(total_duration / 3600, 1)

    serialized_courses = CourseSerializer(published_courses, many=True, context={'request': request}).data

    return Response({
        "id": professor.id,
        "username": professor.username,
        "email": professor.email,
        "bio": professor.bio or "Este professor ainda não adicionou uma bio profissional.",
        "especialidade": "Instrutor de Tecnologia",  
        "stats": {
            "coursesCount": published_courses.count(),
            "lessons": total_lessons,
            "hours": total_hours
        },
        "courses": serialized_courses
    })