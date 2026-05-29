from api.models.inventory_log import InventoryLog
from api.models.item import Item

class InventoryService:
    @staticmethod
    def get_all_logs():
        return InventoryLog.objects.all().order_by('-created_at')

    @staticmethod
    def create_adjustment(item_id, transaction_type, quantity, reason, user=None):
        item = Item.objects.get(pk=item_id)
        if transaction_type == 'IMPORT':
            item.stock += quantity
        elif transaction_type == 'EXPORT':
            item.stock = max(0, item.stock - quantity)
        item.save()

        return InventoryLog.objects.create(
            item=item,
            user=user,
            transaction_type=transaction_type,
            quantity=quantity,
            reason=reason
        )
