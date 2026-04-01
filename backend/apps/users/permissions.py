from rest_framework.permissions import BasePermission
from .models import User


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.ADMIN


class IsSeller(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.SELLER


class IsWarehouse(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.WAREHOUSE


class IsCourier(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.COURIER


class IsAdminOrSeller(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (
            User.Role.ADMIN, User.Role.SELLER
        )
