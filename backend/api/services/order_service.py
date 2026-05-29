from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from api.models import Order, OrderItem, Item
from api.services.inventory_service import InventoryService

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
        """
        Tạo đơn hàng mới và tự động xuất kho hàng (Inventory Adjustment).
        `data` mong đợi cấu trúc:
        {
            "name": "...",
            "phone": "...",
            "address": "...",
            "city": "...",
            "notes": "...",
            "payment_method": "...",
            "items": [
                {"id": 1, "quantity": 2, "selectedSize": "M"},
                ...
            ]
        }
        """
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
        order = Order.objects.create(
            user=user,
            name=data.get('name', '').strip(),
            phone=data.get('phone', '').strip(),
            address=data.get('address', '').strip(),
            city=data.get('city', 'Hồ Chí Minh').strip(),
            notes=data.get('notes', '').strip(),
            payment_method=data.get('payment_method', 'cod').strip(),
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

        return order

    @staticmethod
    def update_order_status(order_id, status_code):
        """
        Cập nhật trạng thái đơn hàng (chỉ Admin).
        """
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
