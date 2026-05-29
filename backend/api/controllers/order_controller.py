from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.serializers import OrderSerializer
from api.services.order_service import OrderService

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_permissions(self):
        # Yêu cầu đăng nhập cho tất cả các thao tác liên quan đến đơn hàng
        permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        # Trả về các đơn hàng tương ứng với người dùng (Khách hàng chỉ xem đơn của họ, Admin xem tất cả)
        return OrderService.get_orders(self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            order = OrderService.create_order(request.user, request.data)
            serializer = self.get_serializer(order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        # Chỉ Admin/Staff mới được cập nhật trạng thái đơn hàng
        if not request.user.is_superuser and not request.user.is_staff:
            return Response({"error": "Bạn không có quyền cập nhật trạng thái đơn hàng."}, status=status.HTTP_403_FORBIDDEN)
        
        status_code = request.data.get('status')
        if not status_code:
            return Response({"error": "Vui lòng cung cấp trạng thái mới."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = OrderService.update_order_status(self.get_object().id, status_code)
            serializer = self.get_serializer(order)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Chỉ Admin/Staff mới được xóa đơn hàng
        if not request.user.is_superuser and not request.user.is_staff:
            return Response({"error": "Bạn không có quyền xóa đơn hàng."}, status=status.HTTP_403_FORBIDDEN)
        
        instance = self.get_object()
        order_id = instance.id
        instance.delete()
        return Response({"message": f"Đã xóa đơn hàng #{order_id} thành công."}, status=status.HTTP_200_OK)
