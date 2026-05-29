from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.services import FavoriteService
from django.core.exceptions import ObjectDoesNotExist

class FavoriteViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        favorites = FavoriteService.get_user_favorites(request.user)
        return Response(favorites, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='toggle')
    def toggle(self, request):
        item_id = request.data.get('item_id')
        if not item_id:
            return Response({"error": "Vui lòng cung cấp mã sản phẩm (item_id)."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            is_favorite = FavoriteService.toggle_favorite(request.user, item_id)
            return Response({"is_favorite": is_favorite}, status=status.HTTP_200_OK)
        except ObjectDoesNotExist as e:
            return Response({"error": str(e)}, status=status.HTTP_444_NOT_FOUND if hasattr(status, 'HTTP_444_NOT_FOUND') else status.HTTP_404_NOT_FOUND)
