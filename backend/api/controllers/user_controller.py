from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from api.serializers import UserSerializer
from api.permissions import HasModelPermission
from api.services import UserService

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [HasModelPermission]

    def get_permissions(self):
        # Cho phép người dùng đã xác thực cập nhật thông tin cá nhân và quản lý 2FA
        if self.action in ['update_profile', 'two_factor_status', 'two_factor_request_code', 'two_factor_enable', 'two_factor_disable']:
            return [IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        return UserService.get_all_users()

    def perform_create(self, serializer):
        serializer.instance = UserService.create_user(serializer.validated_data)

    def perform_update(self, serializer):
        serializer.instance = UserService.update_user(self.get_object().id, serializer.validated_data)

    @action(detail=False, methods=['get'], url_path='2fa-status')
    def two_factor_status(self, request):
        from api.models.user_2fa import User2FA
        user = request.user
        two_factor, created = User2FA.objects.get_or_create(user=user)
        return Response({
            "is_enabled": two_factor.is_enabled
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='2fa-request-code')
    def two_factor_request_code(self, request):
        user = request.user
        from api.services.auth_service import AuthService
        AuthService.send_2fa_setup_otp(user)
        return Response({"message": "Mã xác thực OTP đã được gửi tới email của bạn."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='2fa-enable')
    def two_factor_enable(self, request):
        from api.models.user_2fa import User2FA
        from api.services.auth_service import AuthService
        
        user = request.user
        code = request.data.get('code', '').strip()
        
        try:
            two_factor = User2FA.objects.get(user=user)
        except User2FA.DoesNotExist:
            return Response({"error": "Vui lòng kiểm tra trạng thái 2FA trước."}, status=status.HTTP_400_BAD_REQUEST)
            
        if not code:
            return Response({"error": "Vui lòng nhập mã OTP từ email của bạn."}, status=status.HTTP_400_BAD_REQUEST)
            
        if AuthService.verify_2fa_otp(user.email, code):
            two_factor.is_enabled = True
            two_factor.save()
            return Response({"message": "Xác thực 2 lớp (2FA) đã được kích hoạt thành công!"}, status=status.HTTP_200_OK)
            
        return Response({"error": "Mã xác thực 2FA không chính xác hoặc đã hết hạn. Vui lòng thử lại."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='2fa-disable')
    def two_factor_disable(self, request):
        from api.models.user_2fa import User2FA
        from api.services.auth_service import AuthService
        
        user = request.user
        code = request.data.get('code', '').strip()
        
        try:
            two_factor = User2FA.objects.get(user=user)
        except User2FA.DoesNotExist:
            return Response({"error": "Xác thực 2 lớp chưa được kích hoạt."}, status=status.HTTP_400_BAD_REQUEST)
            
        if not code:
            return Response({"error": "Vui lòng nhập mã OTP từ email của bạn để xác nhận tắt 2FA."}, status=status.HTTP_400_BAD_REQUEST)
            
        if AuthService.verify_2fa_otp(user.email, code):
            two_factor.is_enabled = False
            two_factor.save()
            return Response({"message": "Đã hủy kích hoạt Xác thực 2 lớp thành công."}, status=status.HTTP_200_OK)
            
        return Response({"error": "Mã xác thực 2FA không chính xác hoặc đã hết hạn. Vui lòng thử lại."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['put', 'patch'], url_path='update-profile')
    def update_profile(self, request):
        user = request.user
        data = request.data.copy()
        
        # Ánh xạ từ 'name' của frontend sang 'first_name' của Django User Model
        if 'name' in data:
            data['first_name'] = data.pop('name')
            
        serializer = self.get_serializer(user, data=data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()
            return Response({
                "email": updated_user.email,
                "name": updated_user.first_name or updated_user.username,
                "is_superuser": updated_user.is_superuser,
                "is_staff": updated_user.is_staff,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
