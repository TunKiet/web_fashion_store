from django.db import models

class NewsItem(models.Model):
    title = models.CharField(max_length=500, verbose_name="Tiêu đề")
    link = models.URLField(max_length=1000, unique=True, verbose_name="Đường dẫn")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả")
    pub_date = models.CharField(max_length=100, blank=True, null=True, verbose_name="Ngày đăng gốc")
    pub_date_parsed = models.DateTimeField(null=True, blank=True, verbose_name="Ngày đăng định dạng chuẩn")
    creator = models.CharField(max_length=200, default='Vogue', verbose_name="Tác giả")
    image = models.URLField(max_length=1000, blank=True, null=True, verbose_name="Hình ảnh")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")

    class Meta:
        app_label = 'api'
        verbose_name = "Tin tức"
        verbose_name_plural = "Tin tức"
        ordering = ['-pub_date_parsed', '-created_at']

    def __str__(self):
        return self.title
