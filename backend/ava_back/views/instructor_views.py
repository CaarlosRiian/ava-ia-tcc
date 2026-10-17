import urllib.parse
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from ..models import InstructorRequest
from ..serializers import InstructorRequestSerializer, ProfessorSerializer
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class InstructorRequestViewSet(ModelViewSet):
    serializer_class = InstructorRequestSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return InstructorRequest.objects.select_related("user").all()
        return InstructorRequest.objects.select_related("user").filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def aprovar(self, request, pk=None):
        solicitacao = self.get_object()
        
        solicitacao.status = "approved" 
        solicitacao.save()
        
        user = solicitacao.user
        user.role = "professor"  
        
        especialidades_atuais = user.specialties if isinstance(user.specialties, list) else []
        if solicitacao.especialidade not in especialidades_atuais:
            especialidades_atuais.append(solicitacao.especialidade)
        
        user.specialties = especialidades_atuais
        
        user.save()
        
        return Response({
            "status": "aprovado",
            "role": user.role,
            "specialties": user.specialties
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def rejeitar(self, request, pk=None):
        obj = self.get_object()
        obj.status = "rejected"
        
        motivo = request.data.get("motivo_rejeicao") or request.data.get("motivo")
        if motivo:
            obj.motivo_rejeicao = motivo
            
        obj.save()
        return Response({"status": "rejeitado", "motivo_rejeicao": obj.motivo_rejeicao})

class ProfessorDetailView(APIView):
    def get(self, request, name):
        decoded_name = urllib.parse.unquote(name).strip().lower().rstrip('/')

        professor = User.objects.filter(slug__iexact=decoded_name).first()

        if not professor:
            professor = User.objects.filter(username__iexact=decoded_name).first()

        if not professor:
            return Response({"error": "Professor não encontrado"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProfessorSerializer(professor, context={'request': request})
        return Response(serializer.data)
    