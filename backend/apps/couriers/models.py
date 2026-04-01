from django.db import models
from apps.users.models import User


class Courier(models.Model):
    class Vehicle(models.TextChoices):
        BIKE = 'bike', 'Velosiped'
        MOTORCYCLE = 'motorcycle', 'Motosiklet'
        CAR = 'car', 'Avtomobil'
        FOOT = 'foot', 'Piyada'

    class Zone(models.TextChoices):
        SUMGAYIT = 'sumgayit', 'Sumqayıt'
        BAKU = 'baku', 'Bakı'
        BOTH = 'both', 'Hər ikisi'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='courier_profile')
    vehicle = models.CharField(max_length=20, choices=Vehicle.choices, default=Vehicle.MOTORCYCLE)
    zone = models.CharField(max_length=20, choices=Zone.choices, default=Zone.SUMGAYIT)
    is_active = models.BooleanField(default=True)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.get_full_name()} ({self.get_zone_display()})'
