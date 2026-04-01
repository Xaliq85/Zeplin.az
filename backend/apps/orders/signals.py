from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order


@receiver(post_save, sender=Order)
def order_saved(sender, instance, created, **kwargs):
    from apps.notifications.tasks import (
        send_order_created_notifications,
        notify_order_status_changed,
    )
    if created:
        send_order_created_notifications.delay(instance.id)
    else:
        # Status changed — push WebSocket update
        notify_order_status_changed.delay(instance.id, instance.status)
