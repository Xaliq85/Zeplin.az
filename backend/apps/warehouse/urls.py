from django.urls import path
from .views import StockListView, StockInView, StockAdjustView, StockMovementListView, ScanLabelView

urlpatterns = [
    path('stock/',           StockListView.as_view(),        name='stock_list'),
    path('stock/in/',        StockInView.as_view(),          name='stock_in'),
    path('stock/adjust/',    StockAdjustView.as_view(),      name='stock_adjust'),
    path('stock/movements/', StockMovementListView.as_view(), name='stock_movements'),
    path('scan/<str:code>/', ScanLabelView.as_view(),        name='scan_label'),
]
