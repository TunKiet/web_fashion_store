import logging
from django.core.mail import send_mail
from django.conf import settings
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from api.services import AuthService

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def request_otp(request):
    """
    Yêu cầu mã OTP khôi phục mật khẩu.
    """
    email = request.data.get('email', '').strip()
    if not email:
        return Response({"error": "Vui lòng nhập địa chỉ email."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user, otp_code = AuthService.request_otp(email)

        subject = "[The K Luxury] Mã OTP khôi phục mật khẩu"
        message = (
            f"Chào {user.first_name or user.username or 'quý khách'},\n\n"
            f"Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản tại The K Luxury.\n"
            f"Mã OTP xác thực của bạn là: {otp_code}\n"
            f"Mã này có hiệu lực trong vòng 5 phút.\n\n"
            f"Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.\n\n"
            f"Trân trọng,\nThe K Luxury Editorial Team."
        )
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@thekluxury.com')
        
        send_mail(subject, message, from_email, [email], fail_silently=False)
        
        logger.info(f"Đã gửi mã OTP {otp_code} tới email {email}")
        return Response({"message": "Mã OTP xác nhận đã được gửi tới email của bạn."}, status=status.HTTP_200_OK)

    except ObjectDoesNotExist as e:
        return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Lỗi khi gửi email OTP: {e}")
        return Response({"error": f"Không thể gửi email OTP lúc này. Chi tiết: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Xác thực OTP và đặt lại mật khẩu mới.
    """
    email = request.data.get('email', '').strip()
    otp = request.data.get('otp', '').strip()
    new_password = request.data.get('new_password', '')

    if not email or not otp or not new_password:
        return Response({"error": "Vui lòng nhập đầy đủ Email, OTP và Mật khẩu mới."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        AuthService.reset_password(email, otp, new_password)
        logger.info(f"Đổi mật khẩu thành công cho email: {email}")
        return Response({"message": "Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới."}, status=status.HTTP_200_OK)

    except ValidationError as e:
        error_msg = e.messages[0] if hasattr(e, 'messages') else str(e)
        return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)
    except ObjectDoesNotExist as e:
        return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Lỗi khi đặt lại mật khẩu: {e}")
        return Response({"error": "Không thể đổi mật khẩu lúc này. Vui lòng thử lại sau."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Đăng ký tài khoản thành viên mới.
    """
    name = request.data.get('name', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')

    if not name or not email or not password:
        return Response({"error": "Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        AuthService.register_user(name, email, password)
        return Response({"message": "Đăng ký tài khoản thành viên thành công! Vui lòng đăng nhập."}, status=status.HTTP_201_CREATED)
    except ValidationError as e:
        error_msg = e.messages[0] if hasattr(e, 'messages') else str(e)
        return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Lỗi khi đăng ký user: {e}")
        return Response({"error": "Không thể tạo tài khoản vào lúc này. Vui lòng thử lại sau."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Đăng nhập hệ thống và trả về Token xác thực.
    """
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')

    if not email or not password:
        return Response({"error": "Vui lòng nhập địa chỉ Email và Mật khẩu."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user, token_key = AuthService.login_user(email, password)
        from api.services import FavoriteService
        favorites = FavoriteService.get_user_favorites(user)
        return Response({
            "token": token_key,
            "email": user.email,
            "name": user.first_name or user.username,
            "is_superuser": user.is_superuser,
            "is_staff": user.is_staff,
            "favorites": favorites,
        }, status=status.HTTP_200_OK)
    except ValidationError as e:
        error_msg = e.messages[0] if hasattr(e, 'messages') else str(e)
        return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)

