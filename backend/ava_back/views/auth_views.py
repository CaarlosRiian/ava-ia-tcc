from rest_framework_simplejwt.views import TokenObtainPairView
from ..serializers import EmailTokenSerializer


class EmailTokenView(TokenObtainPairView):
    serializer_class = EmailTokenSerializer