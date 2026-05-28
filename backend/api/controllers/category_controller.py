from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from api.models import Category
from api.serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.save()
        return Response(
            {"message": f"Đã chuyển '{instance.name}' vào thùng rác."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        """Khôi phục danh mục từ thùng rác"""
        instance = self.get_object()
        instance.is_deleted = False
        instance.save()
        return Response(
            {"message": f"Đã khôi phục '{instance.name}' thành công."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['delete'], url_path='force_delete')
    def force_delete(self, request, pk=None):
        """Xóa vĩnh viễn khỏi cơ sở dữ liệu"""
        instance = self.get_object()
        name = instance.name
        instance.delete()
        return Response(
            {"message": f"Đã xóa vĩnh viễn '{name}' khỏi hệ thống."},
            status=status.HTTP_200_OK
        )
