from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class User2FA(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='two_factor')
    secret_key = models.CharField(max_length=32, blank=True)
    is_enabled = models.BooleanField(default=False)

    class Meta:
        app_label = 'api'
        db_table = 'api_user2fa'

    def __str__(self):
        return f"2FA status for {self.user.username} - Enabled: {self.is_enabled}"
