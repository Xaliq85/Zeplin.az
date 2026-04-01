from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.users.permissions import IsAdmin
from .models import Courier
from .serializers import CourierSerializer, CourierCreateSerializer


class CourierListView(generics.ListAPIView):
    permission_classes = (IsAdmin,)
    serializer_class = CourierSerializer
    queryset = Courier.objects.select_related('user').all()


class CourierCreateView(APIView):
    permission_classes = (IsAdmin,)

    def post(self, request):
        serializer = CourierCreateSerializer(data=request.data)
        if serializer.is_valid():
            courier = serializer.save()
            return Response(
                CourierSerializer(courier).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CourierDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAdmin,)
    serializer_class = CourierSerializer
    queryset = Courier.objects.select_related('user').all()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Yalnız courier sahələrini yenilə
        allowed = ('vehicle', 'zone', 'is_active', 'note')
        for field in allowed:
            if field in request.data:
                setattr(instance, field, request.data[field])
        instance.save()
        return Response(CourierSerializer(instance).data)
