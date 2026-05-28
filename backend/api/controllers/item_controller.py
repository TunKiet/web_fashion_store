import os
import uuid
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from api.models import Item
from api.serializers import ItemSerializer

from rest_framework.decorators import api_view, permission_classes, action

class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer

    def get_queryset(self):
        if self.action in ['restore', 'force_delete']:
            return Item.objects.all()
        
        show_trash = self.request.query_params.get('trash', 'false').lower() == 'true'
        if show_trash:
            return Item.objects.filter(is_deleted=True)
        return Item.objects.filter(is_deleted=False)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.save()
        return Response(
            {"message": f"Đã chuyển '{instance.title}' vào thùng rác."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        """Khôi phục sản phẩm từ thùng rác"""
        instance = self.get_object()
        instance.is_deleted = False
        instance.save()
        return Response(
            {"message": f"Đã khôi phục sản phẩm '{instance.title}' thành công."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['delete'], url_path='force_delete')
    def force_delete(self, request, pk=None):
        """Xóa vĩnh viễn sản phẩm khỏi cơ sở dữ liệu"""
        instance = self.get_object()
        title = instance.title
        instance.delete()
        return Response(
            {"message": f"Đã xóa vĩnh viễn sản phẩm '{title}' khỏi hệ thống."},
            status=status.HTTP_200_OK
        )

@api_view(['POST'])
@permission_classes([IsAdminUser])
def upload_image(request):
    """
    Tải lên ảnh từ máy tính (PC) và lưu vào thư mục media.
    Trả về URL của tệp đã tải lên.
    """
    if 'image' not in request.FILES:
        return Response({"error": "Không tìm thấy tệp ảnh gửi lên."}, status=status.HTTP_400_BAD_REQUEST)
    
    image_file = request.FILES['image']
    
    # Tạo thư mục media/uploads nếu chưa tồn tại
    media_root = getattr(settings, 'MEDIA_ROOT', os.path.join(settings.BASE_DIR, 'media'))
    upload_dir = os.path.join(media_root, 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    
    # Kiểm tra định dạng file
    ext = os.path.splitext(image_file.name)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
        return Response({"error": "Định dạng file không hợp lệ. Chỉ chấp nhận jpg, jpeg, png, gif, webp."}, status=status.HTTP_400_BAD_REQUEST)
        
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(upload_dir, filename)
    
    # Ghi file xuống ổ đĩa
    try:
        with open(file_path, 'wb+') as destination:
            for chunk in image_file.chunks():
                destination.write(chunk)
    except Exception as e:
        return Response({"error": f"Không thể lưu file ảnh. Chi tiết: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    media_url = getattr(settings, 'MEDIA_URL', '/media/')
    image_url = f"{media_url}uploads/{filename}"
    
    return Response({"image_url": image_url}, status=status.HTTP_200_OK)
