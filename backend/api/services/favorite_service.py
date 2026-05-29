from api.models.favorite import Favorite
from api.models.item import Item
from django.core.exceptions import ObjectDoesNotExist

class FavoriteService:
    @staticmethod
    def get_user_favorites(user):
        return list(Favorite.objects.filter(user=user).values_list('item_id', flat=True))

    @staticmethod
    def toggle_favorite(user, item_id):
        try:
            item = Item.objects.get(pk=item_id)
        except Item.DoesNotExist:
            raise ObjectDoesNotExist("Sản phẩm không tồn tại.")

        favorite, created = Favorite.objects.get_or_create(user=user, item=item)
        if not created:
            favorite.delete()
            return False
        return True
