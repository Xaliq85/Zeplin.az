from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def notify_order_status_changed(self, order_id: int, new_status: str):
    """Push real-time WebSocket notification when order status changes."""
    try:
        from apps.orders.models import Order
        order = Order.objects.select_related('seller__user').get(id=order_id)

        channel_layer = get_channel_layer()
        payload = {
            'order_id': order_id,
            'tracking_code': order.tracking_code,
            'status': new_status,
            'customer_name': order.customer_name,
            'seller_id': order.seller.user.id,
        }

        # Notify admin group
        async_to_sync(channel_layer.group_send)('admin_orders', {
            'type': 'order_update',
            'data': payload,
        })

        # Notify seller
        async_to_sync(channel_layer.group_send)(f'seller_{order.seller.user.id}', {
            'type': 'order_update',
            'data': payload,
        })

        # If ready for delivery, notify warehouse
        if new_status in ('ready', 'preparing'):
            async_to_sync(channel_layer.group_send)('warehouse_orders', {
                'type': 'order_update',
                'data': payload,
            })

        # Invalidate dashboard caches
        from django.core.cache import cache
        cache.delete('admin_dashboard_stats')
        cache.delete(f'seller_{order.seller.user.id}_stats')

    except Exception as exc:
        logger.error(f'notify_order_status_changed failed: {exc}')
        raise self.retry(exc=exc, countdown=30)


@shared_task(bind=True, max_retries=3)
def send_sms(self, phone: str, message: str):
    """Send SMS via Twilio. Gracefully skips if not configured."""
    from django.conf import settings
    twilio_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
    twilio_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
    twilio_from = getattr(settings, 'TWILIO_FROM_NUMBER', None)

    if not all([twilio_sid, twilio_token, twilio_from]):
        logger.info(f'SMS skipped (Twilio not configured): {phone} → {message}')
        return

    try:
        from twilio.rest import Client
        client = Client(twilio_sid, twilio_token)
        client.messages.create(to=phone, from_=twilio_from, body=message)
        logger.info(f'SMS sent to {phone}')
    except Exception as exc:
        logger.error(f'SMS failed: {exc}')
        raise self.retry(exc=exc, countdown=60)


@shared_task
def send_order_created_notifications(order_id: int):
    """On new order: notify admin via WebSocket + SMS to customer."""
    try:
        from apps.orders.models import Order
        order = Order.objects.select_related('seller__user').get(id=order_id)

        # Real-time admin notification
        notify_order_status_changed.delay(order_id, order.status)

        # SMS to customer
        sms_body = (
            f'Zeplin.az: Sifarişiniz qəbul edildi! '
            f'Tracking: {order.tracking_code}. '
            f'Status: /track/{order.tracking_code}'
        )
        send_sms.delay(order.customer_phone, sms_body)

    except Exception as exc:
        logger.error(f'send_order_created_notifications failed: {exc}')
