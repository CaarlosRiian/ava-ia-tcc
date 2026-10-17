from django.db.models import Sum, Q
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
            "bio": getattr(user, "bio", ""),
            "birth_date": getattr(user, "birth_date", None), 
            "interests": getattr(user, "interests", []),    
            "specialties": getattr(user, "specialties", []),
        })

    elif request.method == "PATCH":
        data = request.data
        
        if "name" in data:
            user.username = data["name"] 
        if "email" in data:
            user.email = data["email"]
        if "bio" in data and hasattr(user, "bio"):
            user.bio = data["bio"]
            
        if "birth_date" in data and hasattr(user, "birth_date"):
            user.birth_date = data["birth_date"] if data["birth_date"] else None

        if "specialties" in data and hasattr(user, "specialties"): 
            user.specialties = data["specialties"]

        if "interests" in data and hasattr(user, "interests"):
            user.interests = data["interests"]
            
        if "password" in data and data["password"]:
            user.set_password(data["password"])

        user.save()

        return Response({ "id": user.id, "name": user.username, "email": user.email,
            "role": user.role, "bio": getattr(user, "bio", ""), "birth_date": getattr(user, "birth_date", None), "interests": getattr(user, "interests", []),    
            "message": "Perfil atualizado com sucesso!" }, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def professor_by_slug(request, slug):
    formatted_slug = slug.replace("-", " ").replace("_", " ").strip()
    
    professor = User.objects.filter(role="professor").filter(
        Q(username__iexact=formatted_slug) | 
        Q(username__iexact=slug) |
        Q(username__icontains=formatted_slug)
    ).first()

    if not professor:
        return Response({"error": "Professor não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    if request.user.is_authenticated and request.user.id == professor.id:
        courses = Course.objects.filter(professor=professor)
    else:
        courses = Course.objects.filter(professor=professor, published=True)

    total_lessons = Lesson.objects.filter(module__course__in=courses).count()
    total_duration = Lesson.objects.filter(module__course__in=courses).aggregate(total=Sum("duration_seconds"))["total"] or 0
    total_hours = round(total_duration / 3600, 1)

    serialized_courses = CourseSerializer(courses, many=True, context={'request': request}).data

    return Response({
        "id": professor.id,
        "username": professor.username,
        "email": professor.email,
        "bio": professor.bio or "Este professor ainda não adicionou uma bio profissional.",
        "created_at": professor.date_joined if hasattr(professor, 'date_joined') else None,
        "especialidade": "Instrutor de Tecnologia",  
        "stats": {
            "coursesCount": courses.count(),
            "lessons": total_lessons,
            "hours": total_hours
        },
        "courses": serialized_courses
    })