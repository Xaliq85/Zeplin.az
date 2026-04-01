from django.urls import path
from .views import OrderListView, OrderDetailView, TrackOrderView, DashboardStatsView

urlpatterns = [
    path('', OrderListView.as_view(), name='order_list'),
    path('stats/', DashboardStatsView.as_view(), name='order_stats'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('track/<str:tracking_code>/', TrackOrderView.as_view(), name='track_order'),
]
