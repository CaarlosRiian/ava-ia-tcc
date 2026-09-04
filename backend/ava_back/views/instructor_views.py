from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from ..models import InstructorRequest
from ..serializers import InstructorRequestSerializer


class InstructorRequestViewSet(ModelViewSet):
    queryset = InstructorRequest.objects.select_related("user").all()
    serializer_class = InstructorRequestSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def aprovar(self, request, pk=None):
        obj = self.get_object()
        obj.status = "approved"
        obj.save()

        user = obj.user
        user.role = "professor"
        user.save()

        return Response({"status": "aprovado"})

    @action(detail=True, methods=["post"])
    def rejeitar(self, request, pk=None):
        obj = self.get_object()
        obj.status = "rejected"
        obj.save()
        return Response({"status": "rejeitado"})