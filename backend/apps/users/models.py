from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        SELLER = 'seller', 'Satıcı'
        WAREHOUSE = 'warehouse', 'Anbar işçisi'
        COURIER = 'courier', 'Kuryer'

    role = models.CharField(max_length=20, choices=Role.choices)
    phone = models.CharField(max_length=20, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['username', 'role']

    def __str__(self):
        return f'{self.get_full_name()} ({self.role})'


class SellerApplication(models.Model):
    class Status(models.TextChoices):
        PENDING  = 'pending',  'Gözləyir'
        APPROVED = 'approved', 'Təsdiqləndi'
        REJECTED = 'rejected', 'Rədd edildi'

    first_name = models.CharField(max_length=100)
    last_name  = models.CharField(max_length=100)
    phone      = models.CharField(max_length=20)
    email      = models.EmailField()
    note       = models.TextField(blank=True)
    status     = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.status})'


class Seller(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='seller_profile')
    company_name = models.CharField(max_length=200, blank=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_verified = models.BooleanField(default=False)
    seller_code = models.CharField(max_length=5, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.seller_code:
            last = Seller.objects.order_by('-id').first()
            next_id = (last.id + 1) if last else 1
            self.seller_code = str(next_id).zfill(5)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.company_name or self.user.get_full_name()


class SellerLabel(models.Model):
    """
    Universal stikerlər (1-1000). Satıcıya verilən zaman
    tam kod: ZEP-{seller.seller_code}-{number:05d} kimi qurulur.
    """
    class Status(models.TextChoices):
        UNUSED = 'unused', 'İstifadə edilməyib'
        USED   = 'used',   'İstifadə edilib'

    seller     = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name='labels')
    number     = models.PositiveIntegerField()          # 1..1000
    status     = models.CharField(max_length=10, choices=Status.choices, default=Status.UNUSED)
    order      = models.ForeignKey('orders.Order', null=True, blank=True, on_delete=models.SET_NULL, related_name='label')
    used_at    = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('seller', 'number')
        unique_together = ('seller', 'number')

    @property
    def code(self):
        return f'ZEP-{self.seller.seller_code}-{self.number:05d}'

    def __str__(self):
        return self.code
