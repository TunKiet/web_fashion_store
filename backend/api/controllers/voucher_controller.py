from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models.voucher import Voucher
from api.serializers import VoucherSerializer
from decimal import Decimal
from api.permissions import HasModelPermission

class VoucherViewSet(viewsets.ModelViewSet):
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    permission_classes = [HasModelPermission]

    def get_permissions(self):
        # Allow regular authenticated customers to view/list vouchers and apply them
        if self.action in ['list', 'retrieve', 'apply_voucher']:
            return [IsAuthenticated()]
        return super().get_permissions()

    @action(detail=False, methods=['post'], url_path='apply')
    def apply_voucher(self, request):
        code = request.data.get('code', '').strip()
        order_total_raw = request.data.get('order_total', 0)

        if not code:
            return Response({"error": "Vui lòng nhập mã giảm giá."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order_total = Decimal(str(order_total_raw))
        except (ValueError, TypeError):
            return Response({"error": "Giá trị đơn hàng không hợp lệ."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            voucher = Voucher.objects.get(code__iexact=code)
        except Voucher.DoesNotExist:
            return Response({"error": "Mã giảm giá không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        is_valid, msg = voucher.is_valid(order_total)
        if not is_valid:
            return Response({"error": msg}, status=status.HTTP_400_BAD_REQUEST)

        discount_amount = voucher.calculate_discount(order_total)
        return Response({
            "valid": True,
            "code": voucher.code,
            "discount_amount": discount_amount,
            "discount_type": voucher.discount_type,
            "discount_value": voucher.discount_value,
            "min_order_value": voucher.min_order_value
        }, status=status.HTTP_200_OK)
