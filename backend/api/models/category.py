from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Tên danh mục")
    slug = models.SlugField(unique=True, verbose_name="Slug")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children', verbose_name="Danh mục cha")
    is_deleted = models.BooleanField(default=False, verbose_name="Đã xóa tạm")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")
    class Meta:
        app_label = 'api'
        verbose_name = "Danh mục"
        verbose_name_plural = "Danh mục"
        ordering = ['name']

    def __str__(self):
        return self.name       
