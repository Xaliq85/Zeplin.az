from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/warehouse/', include('apps.warehouse.urls')),
    path('api/couriers/', include('apps.couriers.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/payments/', include('apps.payments.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
