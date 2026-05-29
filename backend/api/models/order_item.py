from django.db import models
from .order import Order
from .item import Item

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    item = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.IntegerField(default=1)
    selected_size = models.CharField(max_length=10, default='M')

    class Meta:
        app_label = 'api'

    def __str__(self):
        return f"{self.quantity}x {self.title} (Size {self.selected_size}) - Order #{self.order.id}"
