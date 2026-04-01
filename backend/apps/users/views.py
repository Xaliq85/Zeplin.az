from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Seller
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
    SellerSerializer,
)
from .permissions import IsAdmin


class LoginView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    permission_classes = (IsAdmin,)
    serializer_class = UserSerializer
    queryset = User.objects.all()


class SellerListView(generics.ListAPIView):
    permission_classes = (IsAdmin,)
    serializer_class = SellerSerializer
    queryset = Seller.objects.select_related('user').all()


class SellerDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAdmin,)
    serializer_class = SellerSerializer
    queryset = Seller.objects.select_related('user').all()
