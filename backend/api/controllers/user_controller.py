from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from rest_framework import viewsets, status
from rest_framework.response import Response
from api.serializers import UserSerializer
from api.permissions import HasModelPermission
from api.services import UserService

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [HasModelPermission]

    def get_queryset(self):
        return UserService.get_all_users()

    def perform_create(self, serializer):
        serializer.instance = UserService.create_user(serializer.validated_data)

    def perform_update(self, serializer):
        serializer.instance = UserService.update_user(self.get_object().id, serializer.validated_data)

    def destroy(self, request, *args, **kwargs):
        user_to_delete = self.get_object()
        try:
            username = UserService.delete_user(user_to_delete.id, request.user)
            return Response(
                {"message": f"Đã xóa tài khoản '{username}' thành công."},
                status=status.HTTP_200_OK
            )
        except ValidationError as e:
            error_msg = e.messages[0] if hasattr(e, 'messages') else str(e)
            return Response(
                {"error": error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
