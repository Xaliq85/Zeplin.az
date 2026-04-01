from rest_framework import generics
from .models import Product
from .serializers import ProductSerializer
from apps.users.permissions import IsAdminOrSeller


class ProductListView(generics.ListCreateAPIView):
    permission_classes = (IsAdminOrSeller,)
    serializer_class = ProductSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Product.objects.select_related('seller').all()
        return Product.objects.filter(seller__user=user)

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user.seller_profile)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAdminOrSeller,)
    serializer_class = ProductSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Product.objects.all()
        return Product.objects.filter(seller__user=user)
