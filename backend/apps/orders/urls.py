from django.urls import path
from .views import OrderListView, OrderDetailView, TrackOrderView

urlpatterns = [
    path('', OrderListView.as_view(), name='order_list'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('track/<str:tracking_code>/', TrackOrderView.as_view(), name='track_order'),
]
