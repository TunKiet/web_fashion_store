from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from api.models import Order, OrderItem, Item
from api.services.inventory_service import InventoryService
from api.services.momo_service import MomoService

class OrderService:
    @staticmethod
    def get_orders(user, order_id=None):
        """
        Lấy danh sách đơn hàng.
        - Admin/Staff có thể xem tất cả đơn hàng hoặc một đơn hàng cụ thể.
        - Khách hàng thông thường chỉ có thể xem đơn hàng của chính họ.
        """
        if user.is_superuser or user.is_staff:
            queryset = Order.objects.all()
        else:
            queryset = Order.objects.filter(user=user)

        if order_id:
            return queryset.filter(pk=order_id).first()
        return queryset

    @staticmethod
    @transaction.atomic
    def create_order(user, data):
        items_data = data.get('items', [])
        if not items_data:
            raise ValidationError("Đơn hàng phải chứa ít nhất một sản phẩm.")

        # 1. Resolve và kiểm tra sản phẩm
        resolved_items = []
        subtotal = Decimal('0.00')

        for item_data in items_data:
            item_id = item_data.get('id')
            qty = int(item_data.get('quantity', 1))
            size = item_data.get('selectedSize', 'M')

            try:
                product = Item.objects.get(pk=item_id, is_deleted=False)
            except Item.DoesNotExist:
                raise ValidationError(f"Sản phẩm với ID #{item_id} không tồn tại hoặc đã bị xóa.")

            subtotal += Decimal(str(product.price)) * qty
            resolved_items.append((product, qty, size))

        # 2. Tính toán phí vận chuyển (Trị giá đơn > 30 triệu thì miễn phí, ngược lại 35.000đ)
        shipping_fee = Decimal('0.00') if subtotal > Decimal('30000000.00') else Decimal('35000.00')
        total_price = subtotal + shipping_fee

        # 3. Tạo bản ghi đơn hàng
        payment_method = data.get('payment_method', 'cod').strip()
        order = Order.objects.create(
            user=user,
            name=data.get('name', '').strip(),
            phone=data.get('phone', '').strip(),
            address=data.get('address', '').strip(),
            city=data.get('city', 'Hồ Chí Minh').strip(),
            notes=data.get('notes', '').strip(),
            payment_method=payment_method,
            total_price=total_price,
            status='PENDING'
        )

        # 4. Tạo chi tiết đơn hàng và thực hiện trừ kho
        for product, qty, size in resolved_items:
            # Tạo OrderItem
            OrderItem.objects.create(
                order=order,
                item=product,
                title=product.title,
                price=product.price,
                quantity=qty,
                selected_size=size
            )

            # Xuất kho và ghi log thông qua InventoryService
            InventoryService.create_adjustment(
                item_id=product.id,
                transaction_type='EXPORT',
                quantity=qty,
                reason=f"Xuất kho cho Đơn hàng #{order.id}",
                user=user
            )

        # 5. Khởi tạo phiên thanh toán MoMo nếu thanh toán qua MoMo
        if payment_method == 'momo':
            redirect_url = data.get('redirect_url', 'http://localhost:5173/payment-result')
            ipn_url = data.get('ipn_url', 'http://localhost:8000/api/orders/momo-ipn/')
            
            pay_url = MomoService.create_payment_session(order, redirect_url, ipn_url)
            order.pay_url = pay_url

        return order

    @staticmethod
    def update_order_status(order_id, status_code):
        valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
        if status_code not in valid_statuses:
            raise ValidationError(f"Trạng thái '{status_code}' không hợp lệ.")

        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            raise ValidationError(f"Đơn hàng #{order_id} không tồn tại.")

        order.status = status_code
        order.save()
        return order

    @staticmethod
    @transaction.atomic
    def verify_momo_payment(payload):
        """
        Xác minh chữ ký và cập nhật trạng thái đơn hàng dựa trên phản hồi của MoMo.
        """
        # 1. Xác thực chữ ký phản hồi
        is_valid, debug_info = MomoService.verify_callback_signature(payload)
        if not is_valid:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"MoMo signature verification failed. Calculated: {debug_info['calculated_signature']}, Received: {debug_info['received_signature']}, Raw: {debug_info['raw_signature']}")
            raise ValidationError("Chữ ký phản hồi từ MoMo không hợp lệ.")

        # 2. Phân tích cú pháp Order ID để tìm đúng đơn hàng trong database
        order_id_str = payload.get('orderId', '')
        parts = order_id_str.split('_')
        if len(parts) < 3 or parts[0] != 'TK' or parts[1] != 'ORDER':
            raise ValidationError("Mã đơn hàng MoMo gửi về không đúng định dạng.")

        try:
            actual_order_id = int(parts[2])
            order = Order.objects.get(pk=actual_order_id)
        except (ValueError, Order.DoesNotExist):
            raise ValidationError("Đơn hàng tương ứng với mã MoMo không tồn tại.")

        result_code = int(payload.get('resultCode', -1))

        if result_code == 0:
            # Thanh toán thành công
            if order.status == 'PENDING':
                order.status = 'PROCESSING'
                order.notes = f"{order.notes}\n[Thanh toán MoMo thành công. Mã giao dịch MoMo: {payload.get('transId')}].".strip()
                order.save()
        else:
            # Thanh toán thất bại hoặc người dùng hủy bỏ
            if order.status == 'PENDING':
                order.status = 'CANCELLED'
                order.notes = f"{order.notes}\n[Thanh toán MoMo thất bại hoặc bị hủy. Mã lỗi: {result_code}, Lý do: {payload.get('message', '')}].".strip()
                order.save()

                # Tự động hoàn trả hàng lại vào kho
                for order_item in order.items.all():
                    if order_item.item:
                        InventoryService.create_adjustment(
                            item_id=order_item.item.id,
                            transaction_type='IMPORT',
                            quantity=order_item.quantity,
                            reason=f"Hoàn kho tự động (Hủy thanh toán MoMo) cho Đơn hàng #{order.id}",
                            user=None
                        )
        return order
