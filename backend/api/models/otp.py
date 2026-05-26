from django.db import models
from django.utils import timezone
import datetime

class OTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        app_label = 'api'
        ordering = ['-created_at']

    def is_expired(self):
        now = timezone.now()
        diff = now - self.created_at
        return diff > datetime.timedelta(minutes=5)

    def __str__(self):
        return f"{self.email} - {self.otp} - Used: {self.is_used}"
