from rest_framework import serializers
from .models import StockMovement
from apps.products.models import Product


class ProductStockSerializer(serializers.ModelSerializer):
    seller_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ('id', 'name', 'sku', 'seller_name', 'quantity', 'shelf_location', 'is_active')

    def get_seller_name(self, obj):
        return obj.seller.user.get_full_name()


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku  = serializers.CharField(source='product.sku', read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StockMovement
        fields = (
            'id', 'product', 'product_name', 'product_sku',
            'direction', 'reason', 'quantity', 'note',
            'created_by', 'created_by_name', 'created_at',
        )
        read_only_fields = ('created_by', 'created_at')

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else ''


class StockInSerializer(serializers.Serializer):
    product  = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)
    note     = serializers.CharField(required=False, allow_blank=True, default='')
    shelf_location = serializers.CharField(required=False, allow_blank=True, default='')
