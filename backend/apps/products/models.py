from django.db import models
from apps.users.models import Seller


class Product(models.Model):
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    shelf_location = models.CharField(max_length=50, blank=True)
    quantity = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.name} ({self.sku})'
