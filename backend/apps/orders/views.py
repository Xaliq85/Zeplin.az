from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer, TrackOrderSerializer
from rest_framework.permissions import IsAuthenticated
from apps.users.permissions import IsAdminOrSeller


class OrderListView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrSeller()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Order.objects.select_related('seller').prefetch_related('items').all()
        if user.role == 'courier':
            return Order.objects.filter(
                type='delivery',
                status__in=['ready', 'in_delivery', 'delivered']
            ).select_related('seller').prefetch_related('items')
        return Order.objects.filter(seller__user=user).prefetch_related('items')

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user.seller_profile)


class OrderDetailView(generics.RetrieveUpdateAPIView):
    def get_permissions(self):
        return [IsAuthenticated()]

    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Order.objects.all()
        if user.role == 'courier':
            return Order.objects.filter(type='delivery')
        return Order.objects.filter(seller__user=user)


class TrackOrderView(generics.RetrieveAPIView):
    permission_classes = (AllowAny,)
    serializer_class = TrackOrderSerializer
    lookup_field = 'tracking_code'
    queryset = Order.objects.all()
