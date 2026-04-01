from rest_framework import serializers
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

    class Meta:
        model = Order
        fields = ('customer_name', 'customer_phone', 'customer_address',
                  'type', 'pickup_point', 'note', 'items')

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item in items_data:
            OrderItem.objects.create(order=order, **item)
        return order


class TrackOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('tracking_code', 'status', 'type', 'customer_name', 'created_at', 'updated_at')


class PickupPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = PickupPoint
        fields = '__all__'
