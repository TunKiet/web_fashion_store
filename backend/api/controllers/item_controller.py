import os
import uuid
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from api.models import Item
from api.serializers import ItemSerializer
from api.permissions import HasModelPermission
from api.services import ItemService

class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    permission_classes = [HasModelPermission]

    def get_queryset(self):
        if self.action in ['restore', 'force_delete']:
            return Item.objects.all()
        
        show_trash = self.request.query_params.get('trash', 'false').lower() == 'true'
        return ItemService.get_items(trash=show_trash)

    def perform_create(self, serializer):
        serializer.instance = ItemService.create_item(serializer.validated_data)

    def perform_update(self, serializer):
        serializer.instance = ItemService.update_item(self.get_object().id, serializer.validated_data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        ItemService.delete_item(instance.id)
        return Response(
            {"message": f"Đã chuyển '{instance.title}' vào thùng rác."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        """Khôi phục sản phẩm từ thùng rác"""
        instance = self.get_object()
        ItemService.restore_item(instance.id)
        return Response(
            {"message": f"Đã khôi phục sản phẩm '{instance.title}' thành công."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['delete'], url_path='force_delete')
    def force_delete(self, request, pk=None):
        """Xóa vĩnh viễn sản phẩm khỏi cơ sở dữ liệu"""
        instance = self.get_object()
        title = ItemService.force_delete_item(instance.id)
        return Response(
            {"message": f"Đã xóa vĩnh viễn sản phẩm '{title}' khỏi hệ thống."},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], url_path='ai-suggest', permission_classes=[AllowAny])
    def ai_suggest(self, request):
        """Gợi ý sản phẩm sử dụng AI dựa trên truy vấn của khách hàng"""
        query = request.data.get('query', '').strip()
        if not query:
            return Response({"error": "Vui lòng cung cấp từ khóa gợi ý."}, status=status.HTTP_400_BAD_REQUEST)
        
        items = Item.objects.filter(is_deleted=False)
        from api.services.ai_service import AIService
        recommendations = AIService.get_product_recommendations(query, items)
        
        if not recommendations:
            return Response({"recommendations": []}, status=status.HTTP_200_OK)
            
        recommended_ids = [rec.get('id') for rec in recommendations if rec.get('id')]
        items_db = {item.id: item for item in Item.objects.filter(id__in=recommended_ids, is_deleted=False)}
        
        result = []
        for rec in recommendations:
            item_id = rec.get('id')
            reason = rec.get('reason', '')
            if item_id in items_db:
                serializer = self.get_serializer(items_db[item_id])
                item_data = serializer.data
                item_data['recommendation_reason'] = reason
                result.append(item_data)
                
        return Response({"recommendations": result}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def upload_image(request):
    """
    Tải lên ảnh từ máy tính (PC) và lưu vào thư mục media.
    Trả về URL của tệp đã tải lên.
    """
    if not request.user.is_superuser and not (request.user.has_perm('api.add_item') or request.user.has_perm('api.change_item')):
        return Response({"error": "Bạn không có quyền tải ảnh lên."}, status=status.HTTP_403_FORBIDDEN)

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
