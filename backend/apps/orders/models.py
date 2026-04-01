from django.db import models
from apps.users.models import Seller
from apps.products.models import Product


class PickupPoint(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    working_hours = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Gözləyir'
        CONFIRMED = 'confirmed', 'Təsdiqləndi'
        PREPARING = 'preparing', 'Hazırlanır'
        READY = 'ready', 'Hazırdır'
        IN_DELIVERY = 'in_delivery', 'Yoldadır'
        DELIVERED = 'delivered', 'Çatdırıldı'
        PICKED_UP = 'picked_up', 'Götürüldü'
        CANCELLED = 'cancelled', 'Ləğv edildi'

    class Type(models.TextChoices):
        DELIVERY = 'delivery', 'Çatdırılma'
        PICKUP = 'pickup', 'Pickup'

    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name='orders')
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=20)
    customer_address = models.TextField(blank=True)
    type = models.CharField(max_length=10, choices=Type.choices)
    pickup_point = models.ForeignKey(PickupPoint, null=True, blank=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    note = models.TextField(blank=True)
    tracking_code = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'#{self.tracking_code} — {self.customer_name}'

    def save(self, *args, **kwargs):
        if not self.tracking_code:
            import uuid
            self.tracking_code = str(uuid.uuid4()).upper()[:10]
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.product.name} x{self.quantity}'
