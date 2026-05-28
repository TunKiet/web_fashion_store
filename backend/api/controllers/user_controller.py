from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from api.serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        user_to_delete = self.get_object()
        # Prevent self-deletion
        if user_to_delete == request.user:
            return Response(
                {"error": "Bạn không thể tự xóa tài khoản của chính mình."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        username = user_to_delete.username
        user_to_delete.delete()
        return Response(
            {"message": f"Đã xóa tài khoản '{username}' thành công."},
            status=status.HTTP_200_OK
        )
