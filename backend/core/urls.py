from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from ava_back.views import EmailTokenView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('ava_back.urls')),
    path('api/token/', EmailTokenView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),

]
