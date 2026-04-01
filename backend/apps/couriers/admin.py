from django.contrib import admin
from .models import Courier

@admin.register(Courier)
class CourierAdmin(admin.ModelAdmin):
    list_display = ('user', 'vehicle', 'zone', 'is_active', 'created_at')
    list_filter = ('vehicle', 'zone', 'is_active')
