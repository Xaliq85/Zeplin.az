from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Seller


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('phone', 'first_name', 'last_name', 'role', 'is_active')
    list_filter = ('role', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Əlavə məlumat', {'fields': ('phone', 'role')}),
    )


@admin.register(Seller)
class SellerAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'user', 'balance', 'is_verified')
    list_filter = ('is_verified',)
