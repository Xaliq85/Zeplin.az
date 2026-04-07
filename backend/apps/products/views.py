from rest_framework import generics
from .models import Product
from .serializers import ProductSerializer
from apps.users.permissions import IsAdminOrSeller
from apps.users.models import Seller


class ProductListView(generics.ListCreateAPIView):
    permission_classes = (IsAdminOrSeller,)
    serializer_class = ProductSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Product.objects.select_related('seller__user').all()
        return Product.objects.select_related('seller__user').filter(seller__user=user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'admin':
            seller_id = self.request.data.get('seller')
            seller = Seller.objects.get(pk=seller_id)
        else:
            seller = user.seller_profile
        serializer.save(seller=seller)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAdminOrSeller,)
    serializer_class = ProductSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Product.objects.select_related('seller__user').all()
        return Product.objects.select_related('seller__user').filter(seller__user=user)
