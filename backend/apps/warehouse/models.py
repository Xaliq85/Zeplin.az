from django.db import models
from apps.products.models import Product
from apps.users.models import User


class StockMovement(models.Model):
    class Direction(models.TextChoices):
        IN  = 'in',  'Giriş'
        OUT = 'out', 'Çıxış'

    class Reason(models.TextChoices):
        SELLER_DELIVERY = 'seller_delivery', 'Satıcı təhvil verdi'
        ORDER_SHIPPED   = 'order_shipped',   'Sifariş göndərildi'
        RETURN          = 'return',          'Geri qaytarma'
        ADJUSTMENT      = 'adjustment',      'Düzəliş'
        DAMAGE          = 'damage',          'Zədə / itki'

    product   = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='movements')
    direction = models.CharField(max_length=3, choices=Direction.choices)
    reason    = models.CharField(max_length=30, choices=Reason.choices)
    quantity  = models.PositiveIntegerField()
    note      = models.TextField(blank=True)
    created_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='stock_movements')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.get_direction_display()} — {self.product.name} x{self.quantity}'
