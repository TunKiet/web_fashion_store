from django.db import models
from django.contrib.auth.models import User
from api.models.item import Item

class InventoryLog(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='inventory_logs')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    transaction_type = models.CharField(max_length=10, choices=[('IMPORT', 'Nhập kho'), ('EXPORT', 'Xuất kho')])
    quantity = models.IntegerField()
    reason = models.CharField(max_length=255, default="", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'api'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type} - {self.item.title} - Qty: {self.quantity}"
