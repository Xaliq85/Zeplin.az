from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Order


@receiver(pre_save, sender=Order)
def order_pre_save(sender, instance, **kwargs):
    """Track previous status to detect transitions."""
    if instance.pk:
        try:
            instance._prev_status = Order.objects.get(pk=instance.pk).status
        except Order.DoesNotExist:
            instance._prev_status = None
    else:
        instance._prev_status = None


@receiver(post_save, sender=Order)
def order_saved(sender, instance, created, **kwargs):
    from apps.notifications.tasks import (
        send_order_created_notifications,
        notify_order_status_changed,
    )
    if created:
        send_order_created_notifications.delay(instance.id)
    else:
        notify_order_status_changed.delay(instance.id, instance.status)

        # Deduct stock when order moves to 'in_delivery' (shipped out of warehouse)
        prev = getattr(instance, '_prev_status', None)
        if prev != 'in_delivery' and instance.status == 'in_delivery':
            _deduct_stock_for_order(instance)


def _deduct_stock_for_order(order):
    """Create StockMovement OUT records for each item in the order."""
    from django.db import transaction
    from apps.warehouse.models import StockMovement

    with transaction.atomic():
        for item in order.items.select_related('product').all():
            product = item.product
            deduct = min(item.quantity, product.quantity)
            if deduct > 0:
                product.quantity -= deduct
                product.save(update_fields=['quantity', 'updated_at'])
                StockMovement.objects.create(
                    product=product,
                    direction=StockMovement.Direction.OUT,
                    reason=StockMovement.Reason.ORDER_SHIPPED,
                    quantity=deduct,
                    note=f'Sifariş #{order.tracking_code}',
                    created_by=None,
                )
