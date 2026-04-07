from django.db import transaction
from django.db.models import Exists, OuterRef
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products.models import Product
from apps.users.permissions import IsAdmin, IsWarehouse
from .models import StockMovement
from .serializers import ProductStockSerializer, StockMovementSerializer, StockInSerializer


class StockListView(generics.ListAPIView):
    """All products with current stock levels. Admin + warehouse."""
    serializer_class = ProductStockSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        # Only show products that have been physically received (at least one StockIN)
        received = StockMovement.objects.filter(
            product=OuterRef('pk'), direction=StockMovement.Direction.IN
        )
        qs = Product.objects.select_related('seller__user').filter(
            is_active=True
        ).annotate(ever_received=Exists(received)).filter(ever_received=True)
        if user.role == 'seller':
            qs = qs.filter(seller__user=user)
        # search by name or sku
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(name__icontains=q) | qs.filter(sku__icontains=q)
        return qs


class StockInView(APIView):
    """Warehouse staff records incoming stock from a seller."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role not in ('admin', 'warehouse'):
            return Response({'detail': 'İcazə yoxdur.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = StockInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        product = data['product']
        qty     = data['quantity']
        note    = data.get('note', '')
        shelf   = data.get('shelf_location', '')

        with transaction.atomic():
            product.quantity += qty
            if shelf:
                product.shelf_location = shelf
            product.save(update_fields=['quantity', 'shelf_location', 'updated_at'])

            movement = StockMovement.objects.create(
                product=product,
                direction=StockMovement.Direction.IN,
                reason=StockMovement.Reason.SELLER_DELIVERY,
                quantity=qty,
                note=note,
                created_by=request.user,
            )

        return Response(StockMovementSerializer(movement).data, status=status.HTTP_201_CREATED)


class StockAdjustView(APIView):
    """Admin manual adjustment (damage, correction, return)."""
    permission_classes = [IsAdmin]

    def post(self, request):
        product_id = request.data.get('product')
        direction  = request.data.get('direction')
        reason     = request.data.get('reason', 'adjustment')
        qty        = int(request.data.get('quantity', 0))
        note       = request.data.get('note', '')

        if direction not in ('in', 'out') or qty <= 0:
            return Response({'detail': 'Yanlış məlumat.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'detail': 'Məhsul tapılmadı.'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            if direction == 'in':
                product.quantity += qty
            else:
                if product.quantity < qty:
                    return Response(
                        {'detail': 'Stokda kifayət qədər məhsul yoxdur.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                product.quantity -= qty
            product.save(update_fields=['quantity', 'updated_at'])

            movement = StockMovement.objects.create(
                product=product,
                direction=direction,
                reason=reason,
                quantity=qty,
                note=note,
                created_by=request.user,
            )

        return Response(StockMovementSerializer(movement).data, status=status.HTTP_201_CREATED)


class StockMovementListView(generics.ListAPIView):
    """Movement history. Admin sees all, warehouse sees all, seller sees own products."""
    serializer_class = StockMovementSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = StockMovement.objects.select_related('product__seller__user', 'created_by')
        if user.role == 'seller':
            qs = qs.filter(product__seller__user=user)
        product_id = self.request.query_params.get('product')
        if product_id:
            qs = qs.filter(product_id=product_id)
        return qs[:100]
