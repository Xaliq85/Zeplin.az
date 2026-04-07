from rest_framework import serializers
from django.utils import timezone
from .models import Order, OrderItem, PickupPoint


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'quantity', 'price')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('seller', 'tracking_code', 'created_at', 'updated_at')


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    label_code = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Order
        fields = ('customer_name', 'customer_phone', 'customer_address',
                  'type', 'pickup_point', 'note', 'label_code', 'items')

    def validate_label_code(self, value):
        if not value:
            return value
        from apps.users.models import SellerLabel
        value = value.upper().strip()
        try:
            label = SellerLabel.objects.get(code=value)
        except SellerLabel.DoesNotExist:
            raise serializers.ValidationError('Bu stiker kodu mövcud deyil.')
        if label.status == SellerLabel.Status.USED:
            raise serializers.ValidationError('Bu stiker artıq istifadə edilib.')
        self._label = label
        return value

    def create(self, validated_data):
        from apps.users.models import SellerLabel
        items_data = validated_data.pop('items')
        label_code = validated_data.pop('label_code', '')
        order = Order.objects.create(**validated_data)
        for item in items_data:
            OrderItem.objects.create(order=order, **item)
        if label_code:
            label = getattr(self, '_label', None) or SellerLabel.objects.get(code=label_code)
            label.order = order
            label.status = SellerLabel.Status.USED
            label.used_at = timezone.now()
            label.save(update_fields=['order', 'status', 'used_at'])
        return order


class TrackOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('tracking_code', 'status', 'type', 'customer_name', 'created_at', 'updated_at')


class PickupPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = PickupPoint
        fields = '__all__'
