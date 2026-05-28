from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from api.models import Category
from api.serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        if self.action in ['restore', 'force_delete']:
            return Category.objects.all()
        
        show_trash = self.request.query_params.get('trash', 'false').lower() == 'true'
        if show_trash:
            return Category.objects.filter(is_deleted=True)
        return Category.objects.filter(is_deleted=False)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

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
