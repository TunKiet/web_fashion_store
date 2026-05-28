from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from api.models import Category
from api.serializers import CategorySerializer
from api.permissions import HasModelPermission
from api.services import CategoryService


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [HasModelPermission]

    def get_queryset(self):
        if self.action in ['restore', 'force_delete']:
            return Category.objects.all()
        
        show_trash = self.request.query_params.get('trash', 'false').lower() == 'true'
        return CategoryService.get_categories(trash=show_trash)

    def perform_create(self, serializer):
        serializer.instance = CategoryService.create_category(serializer.validated_data)

    def perform_update(self, serializer):
        serializer.instance = CategoryService.update_category(self.get_object().id, serializer.validated_data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        CategoryService.delete_category(instance.id)
        return Response(
            {"message": f"Đã chuyển '{instance.name}' vào thùng rác."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        """Khôi phục danh mục từ thùng rác"""
        instance = self.get_object()
        CategoryService.restore_category(instance.id)
        return Response(
            {"message": f"Đã khôi phục '{instance.name}' thành công."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['delete'], url_path='force_delete')
    def force_delete(self, request, pk=None):
        """Xóa vĩnh viễn khỏi cơ sở dữ liệu"""
        instance = self.get_object()
        name = CategoryService.force_delete_category(instance.id)
        return Response(
            {"message": f"Đã xóa vĩnh viễn '{name}' khỏi hệ thống."},
            status=status.HTTP_200_OK
        )
