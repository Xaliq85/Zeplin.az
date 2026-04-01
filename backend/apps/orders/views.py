from django.core.cache import cache
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdminOrSeller, IsAdmin
from .models import Order, PickupPoint
from .serializers import OrderSerializer, OrderCreateSerializer, TrackOrderSerializer, PickupPointSerializer


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

    def perform_update(self, serializer):
        instance = serializer.save()
        # Invalidate cached dashboard stats on any order update
        cache.delete('admin_dashboard_stats')
        try:
            seller_user_id = instance.seller.user.id
            cache.delete(f'seller_{seller_user_id}_stats')
        except Exception:
            pass


class TrackOrderView(generics.RetrieveAPIView):
    permission_classes = (AllowAny,)
    serializer_class = TrackOrderSerializer
    lookup_field = 'tracking_code'
    queryset = Order.objects.all()


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        if user.role == 'admin':
            cache_key = 'admin_dashboard_stats'
            ttl = 300  # 5 minutes
            stats = cache.get(cache_key)
            if not stats:
                stats = {
                    'total_orders': Order.objects.count(),
                    'today_orders': Order.objects.filter(created_at__date=today).count(),
                    'pending_orders': Order.objects.filter(status='pending').count(),
                    'in_delivery': Order.objects.filter(status='in_delivery').count(),
                    'delivered_today': Order.objects.filter(
                        status='delivered', updated_at__date=today
                    ).count(),
                }
                cache.set(cache_key, stats, ttl)
        else:  # seller
            cache_key = f'seller_{user.id}_stats'
            ttl = 120  # 2 minutes
            stats = cache.get(cache_key)
            if not stats:
                qs = Order.objects.filter(seller__user=user)
                stats = {
                    'total_orders': qs.count(),
                    'today_orders': qs.filter(created_at__date=today).count(),
                    'pending_orders': qs.filter(status='pending').count(),
                    'delivered_orders': qs.filter(status='delivered').count(),
                }
                cache.set(cache_key, stats, ttl)

        return Response(stats)


class PickupPointListView(generics.ListCreateAPIView):
    serializer_class = PickupPointSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = PickupPoint.objects.all()
        if self.request.query_params.get('active') == 'true':
            qs = qs.filter(is_active=True)
        return qs


class PickupPointDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = PickupPointSerializer
    queryset = PickupPoint.objects.all()
