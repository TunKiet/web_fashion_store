from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Voucher(models.Model):
    DISCOUNT_TYPES = [
        ('percentage', 'Phần trăm'),
        ('fixed', 'Số tiền cố định'),
    ]

    code = models.CharField(max_length=50, unique=True, db_index=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default='fixed')
    discount_value = models.DecimalField(max_digits=12, decimal_places=2)
    min_order_value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_to = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=True)
    usage_limit = models.IntegerField(null=True, blank=True)
    used_count = models.IntegerField(default=0)

    class Meta:
        app_label = 'api'
        db_table = 'api_voucher'

    def is_valid(self, order_value=0):
        now = timezone.now()
        if not self.is_active:
            return False, "Voucher này không còn hoạt động."
        if now < self.valid_from or now > self.valid_to:
            return False, "Voucher đã hết hạn sử dụng."
        if self.usage_limit is not None and self.used_count >= self.usage_limit:
            return False, "Voucher đã hết lượt sử dụng."
        if order_value < self.min_order_value:
            return False, f"Giá trị đơn hàng tối thiểu để sử dụng voucher là {int(self.min_order_value):,} đ."
        return True, ""

    def calculate_discount(self, order_value):
        if self.discount_type == 'percentage':
            discount = order_value * (self.discount_value / 100)
            return min(discount, order_value)
        else:
            return min(self.discount_value, order_value)

    def __str__(self):
        return f"{self.code} - {self.discount_type} - {self.discount_value}"

class VoucherUsage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='voucher_usages')
    voucher = models.ForeignKey(Voucher, on_delete=models.CASCADE, related_name='usages')
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='voucher_usages')
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'api'
        db_table = 'api_voucher_usage'

    def __str__(self):
        return f"{self.user.username} used {self.voucher.code} on Order #{self.order.id}"
