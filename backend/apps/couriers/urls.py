from django.urls import path
from .views import CourierListView, CourierCreateView, CourierDetailView

urlpatterns = [
    path('', CourierListView.as_view(), name='courier_list'),
    path('create/', CourierCreateView.as_view(), name='courier_create'),
    path('<int:pk>/', CourierDetailView.as_view(), name='courier_detail'),
]
