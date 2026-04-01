from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, RegisterView, MeView, UserListView, SellerListView, SellerDetailView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('sellers/', SellerListView.as_view(), name='seller_list'),
    path('sellers/<int:pk>/', SellerDetailView.as_view(), name='seller_detail'),
]
