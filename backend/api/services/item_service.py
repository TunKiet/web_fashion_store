from api.models import Item

class ItemService:
    @staticmethod
    def get_items(trash=False):
        if trash:
            return Item.objects.filter(is_deleted=True)
        return Item.objects.filter(is_deleted=False)

    @staticmethod
    def create_item(validated_data):
        item = Item.objects.create(**validated_data)
        if item.stock > 0:
            from api.models.inventory_log import InventoryLog
            InventoryLog.objects.create(
                item=item,
                transaction_type='IMPORT',
                quantity=item.stock,
                reason="Nhập kho ban đầu khi tạo sản phẩm"
            )
        return item

    @staticmethod
    def update_item(item_id, validated_data):
        item = Item.objects.get(pk=item_id)
        old_stock = item.stock
        new_stock = validated_data.get('stock')
        
        for attr, value in validated_data.items():
            setattr(item, attr, value)
        item.save()

        if new_stock is not None and new_stock != old_stock:
            from api.models.inventory_log import InventoryLog
            diff = new_stock - old_stock
            transaction_type = 'IMPORT' if diff > 0 else 'EXPORT'
            InventoryLog.objects.create(
                item=item,
                transaction_type=transaction_type,
                quantity=abs(diff),
                reason="Điều chỉnh tồn kho từ trang quản trị"
            )
        return item

    @staticmethod
    def delete_item(item_id):
        item = Item.objects.get(pk=item_id)
        item.is_deleted = True
        item.save()
        return item

    @staticmethod
    def restore_item(item_id):
        item = Item.objects.get(pk=item_id)
        item.is_deleted = False
        item.save()
        return item

    @staticmethod
    def force_delete_item(item_id):
        item = Item.objects.get(pk=item_id)
        title = item.title
        item.delete()
        return title
