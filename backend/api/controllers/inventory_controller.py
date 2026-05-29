from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from api.services import InventoryService
from django.core.exceptions import ObjectDoesNotExist

class InventoryViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    def list(self, request):
        logs = InventoryService.get_all_logs()
        data = []
        for log in logs:
            data.append({
                "id": log.id,
                "item_id": log.item_id,
                "item_title": log.item.title,
                "user_email": log.user.email if log.user else "Hệ thống",
                "transaction_type": log.transaction_type,
                "quantity": log.quantity,
                "reason": log.reason,
                "created_at": log.created_at.isoformat()
            })
        return Response(data, status=status.HTTP_200_OK)

    def create(self, request):
        item_id = request.data.get('item_id')
        transaction_type = request.data.get('transaction_type')
        quantity = request.data.get('quantity')
        reason = request.data.get('reason', '')

        if not item_id or not transaction_type or quantity is None:
            return Response({"error": "Vui lòng cung cấp đầy đủ thông tin sản phẩm, loại giao dịch và số lượng."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            quantity = int(quantity)
            if quantity <= 0:
                return Response({"error": "Số lượng phải lớn hơn 0."}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "Số lượng không hợp lệ."}, status=status.HTTP_400_BAD_REQUEST)

        if transaction_type not in ['IMPORT', 'EXPORT']:
            return Response({"error": "Loại giao dịch không hợp lệ (chỉ chấp nhận IMPORT hoặc EXPORT)."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            log = InventoryService.create_adjustment(
                item_id=item_id,
                transaction_type=transaction_type,
                quantity=quantity,
                reason=reason,
                user=request.user
            )
            return Response({
                "message": f"Đã thực hiện giao dịch {transaction_type} thành công cho sản phẩm '{log.item.title}'.",
                "log": {
                    "id": log.id,
                    "item_id": log.item_id,
                    "item_title": log.item.title,
                    "user_email": log.user.email if log.user else "Hệ thống",
                    "transaction_type": log.transaction_type,
                    "quantity": log.quantity,
                    "reason": log.reason,
                    "created_at": log.created_at.isoformat()
                }
            }, status=status.HTTP_201_CREATED)
        except ObjectDoesNotExist as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Lỗi hệ thống: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
