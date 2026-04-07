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
    label_number = serializers.IntegerField(required=False, allow_null=True, min_value=1, max_value=1000)

    class Meta:
        model = Order
        fields = ('customer_name', 'customer_phone', 'customer_address',
                  'type', 'pickup_point', 'note', 'label_number', 'items')

    def validate_label_number(self, value):
        if value is None:
            return value
        request = self.context.get('request')
        if not request or request.user.role != 'seller':
            return value
        from apps.users.models import SellerLabel
        try:
            seller = request.user.seller_profile
        except Exception:
            raise serializers.ValidationError('Satıcı profili tapılmadı.')
        try:
            label = SellerLabel.objects.get(seller=seller, number=value)
        except SellerLabel.DoesNotExist:
            raise serializers.ValidationError(f'{value} nömrəli stiker tapılmadı. Zeplin.az-dan stiker almısınızmı?')
        if label.status == SellerLabel.Status.USED:
            raise serializers.ValidationError(f'{value} nömrəli stiker artıq istifadə edilib.')
        self._label = label
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        label_number = validated_data.pop('label_number', None)
        order = Order.objects.create(**validated_data)
        for item in items_data:
            OrderItem.objects.create(order=order, **item)
        if label_number:
            label = getattr(self, '_label', None)
            if label:
                order.label_code = label.code
                order.save(update_fields=['label_code'])
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
