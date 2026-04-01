from rest_framework import serializers
from apps.users.models import User
from apps.users.serializers import UserSerializer
from .models import Courier


class CourierSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    total_orders = serializers.SerializerMethodField()
    today_orders = serializers.SerializerMethodField()

    class Meta:
        model = Courier
        fields = ('id', 'user', 'full_name', 'vehicle', 'zone',
                  'is_active', 'note', 'created_at', 'total_orders', 'today_orders')

    def get_full_name(self, obj):
        return obj.user.get_full_name()

    def get_total_orders(self, obj):
        from apps.orders.models import Order
        return Order.objects.filter(
            status__in=['delivered', 'picked_up']
        ).count()

    def get_today_orders(self, obj):
        from apps.orders.models import Order
        from django.utils import timezone
        today = timezone.now().date()
        return Order.objects.filter(
            status__in=['delivered', 'picked_up'],
            updated_at__date=today
        ).count()


class CourierCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    phone = serializers.CharField()
    password = serializers.CharField(min_length=6)
    vehicle = serializers.ChoiceField(choices=Courier.Vehicle.choices)
    zone = serializers.ChoiceField(choices=Courier.Zone.choices)
    note = serializers.CharField(required=False, allow_blank=True)

    def validate_phone(self, value):
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError('Bu telefon artıq qeydiyyatdadır.')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['phone'],
            phone=validated_data['phone'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password'],
            role=User.Role.COURIER,
        )
        courier = Courier.objects.create(
            user=user,
            vehicle=validated_data['vehicle'],
            zone=validated_data['zone'],
            note=validated_data.get('note', ''),
        )
        return courier
