from django.db import models
from django.contrib.auth.models import User
from api.models.item import Item

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'api'
        unique_together = ('user', 'item')

    def __str__(self):
        return f"{self.user.username} favorited {self.item.title}"
