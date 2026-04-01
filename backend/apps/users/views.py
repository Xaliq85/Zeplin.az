from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.conf import settings
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, Seller, SellerApplication
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
    SellerSerializer,
    SellerApplicationSerializer,
    SetPasswordSerializer,
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


# ── Seller Applications ────────────────────────────────────────────────────

class SellerApplicationCreateView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = SellerApplicationSerializer


class SellerApplicationListView(generics.ListAPIView):
    permission_classes = (IsAdmin,)
    serializer_class = SellerApplicationSerializer

    def get_queryset(self):
        qs = SellerApplication.objects.all()
        s = self.request.query_params.get('status')
        if s:
            qs = qs.filter(status=s)
        return qs


class ApproveApplicationView(APIView):
    permission_classes = (IsAdmin,)

    def post(self, request, pk):
        try:
            app = SellerApplication.objects.get(pk=pk)
        except SellerApplication.DoesNotExist:
            return Response({'detail': 'Müraciət tapılmadı.'}, status=status.HTTP_404_NOT_FOUND)

        if app.status != SellerApplication.Status.PENDING:
            return Response({'detail': 'Bu müraciət artıq işlənib.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(phone=app.phone).exists():
            return Response({'detail': 'Bu telefon nömrəsi artıq qeydiyyatlıdır.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=app.phone,
            phone=app.phone,
            first_name=app.first_name,
            last_name=app.last_name,
            role=User.Role.SELLER,
            email=app.email,
            password=None,
        )
        user.set_unusable_password()
        user.save()
        Seller.objects.create(user=user, is_verified=True)

        token = PasswordResetTokenGenerator().make_token(user)
        uid   = urlsafe_base64_encode(force_bytes(user.pk))
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        setup_link   = f'{frontend_url}/set-password/{uid}/{token}'

        send_mail(
            subject='Zeplin.az — Hesabınız təsdiqləndi',
            message=(
                f'Salam {user.first_name}!\n\n'
                f'Zeplin.az satıcı hesabınız təsdiqləndi.\n'
                f'Şifrənizi təyin etmək üçün linkə klikləyin:\n\n'
                f'{setup_link}\n\n'
                f'Link 24 saat keçərlidir.\n\n'
                f'Zeplin.az komandası'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[app.email],
            fail_silently=True,
        )

        app.status = SellerApplication.Status.APPROVED
        app.save()
        return Response({'detail': 'Müraciət təsdiqləndi, email göndərildi.'})


class RejectApplicationView(APIView):
    permission_classes = (IsAdmin,)

    def post(self, request, pk):
        try:
            app = SellerApplication.objects.get(pk=pk)
        except SellerApplication.DoesNotExist:
            return Response({'detail': 'Müraciət tapılmadı.'}, status=status.HTTP_404_NOT_FOUND)

        app.status = SellerApplication.Status.REJECTED
        app.save()
        return Response({'detail': 'Müraciət rədd edildi.'})


class SetPasswordView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = SetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            uid  = force_str(urlsafe_base64_decode(serializer.validated_data['uid']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, User.DoesNotExist):
            return Response({'detail': 'Keçərsiz link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not PasswordResetTokenGenerator().check_token(user, serializer.validated_data['token']):
            return Response({'detail': 'Link vaxtı keçib və ya keçərsizdir.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['password'])
        user.save()
        return Response({'detail': 'Şifrə uğurla təyin edildi.'})
