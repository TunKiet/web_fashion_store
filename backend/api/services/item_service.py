from api.models import Item

class ItemService:
    @staticmethod
    def get_items(trash=False):
        if trash:
            return Item.objects.filter(is_deleted=True)
        return Item.objects.filter(is_deleted=False)

    @staticmethod
    def create_item(validated_data):
        return Item.objects.create(**validated_data)

    @staticmethod
    def update_item(item_id, validated_data):
        item = Item.objects.get(pk=item_id)
        for attr, value in validated_data.items():
            setattr(item, attr, value)
        item.save()
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
