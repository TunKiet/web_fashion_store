import random
import logging
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from api.models import OTP

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

    # Kiểm tra xem user có tồn tại với email này không
    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "Email không tồn tại trong hệ thống."}, status=status.HTTP_404_NOT_FOUND)

    # Sinh mã OTP 6 chữ số ngẫu nhiên
    otp_code = f"{random.randint(100000, 999999)}"

    try:
        # Vô hiệu hóa các mã OTP cũ chưa sử dụng của email này
        OTP.objects.filter(email=email, is_used=False).update(is_used=True)

        # Lưu mã OTP mới vào cơ sở dữ liệu
        OTP.objects.create(email=email, otp=otp_code)

        # Gửi mail cho khách hàng
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

    if len(new_password) < 6:
        return Response({"error": "Mật khẩu phải chứa ít nhất 6 ký tự."}, status=status.HTTP_400_BAD_REQUEST)

    # Tìm OTP chưa dùng mới nhất cho email này
    otp_record = OTP.objects.filter(email=email, is_used=False).first()
    if not otp_record or otp_record.otp != otp:
        return Response({"error": "Mã OTP không chính xác hoặc đã được sử dụng trước đó."}, status=status.HTTP_400_BAD_REQUEST)

    # Kiểm tra hiệu lực 5 phút
    if otp_record.is_expired():
        # Đánh dấu là đã dùng/hết hạn để dọn dẹp
        otp_record.is_used = True
        otp_record.save()
        return Response({"error": "Mã OTP đã hết hạn (hiệu lực tối đa 5 phút). Vui lòng yêu cầu mã mới."}, status=status.HTTP_400_BAD_REQUEST)

    # Thực hiện đổi mật khẩu
    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "Người dùng sở hữu email này không còn tồn tại."}, status=status.HTTP_404_NOT_FOUND)

    try:
        user.set_password(new_password)
        user.save()

        # Đánh dấu OTP đã được sử dụng thành công
        otp_record.is_used = True
        otp_record.save()

        logger.info(f"Đổi mật khẩu thành công cho email: {email}")
        return Response({"message": "Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới."}, status=status.HTTP_200_OK)

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

    if len(password) < 6:
        return Response({"error": "Mật khẩu phải chứa ít nhất 6 ký tự."}, status=status.HTTP_400_BAD_REQUEST)

    # Kiểm tra xem user đã tồn tại chưa
    if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
        return Response({"error": "Email này đã được đăng ký tài khoản thành viên."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Tạo user mới
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name
        )
        user.save()
        return Response({"message": "Đăng ký tài khoản thành viên thành công! Vui lòng đăng nhập."}, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f"Lỗi khi đăng ký user: {e}")
        return Response({"error": "Không thể tạo tài khoản vào lúc này. Vui lòng thử lại sau."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Đăng nhập hệ thống và trả về Token xác thực.
    """
    from django.contrib.auth import authenticate
    from rest_framework.authtoken.models import Token

    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')

    if not email or not password:
        return Response({"error": "Vui lòng nhập địa chỉ Email và Mật khẩu."}, status=status.HTTP_400_BAD_REQUEST)

    # Django authenticate dùng username, ở đây ta lưu username là email
    user = authenticate(username=email, password=password)

    if user is None:
        # Có thể người dùng nhập email nhưng username khác (ví dụ admin)
        # Hãy kiểm tra thử xem có user nào có email này không
        user_by_email = User.objects.filter(email=email).first()
        if user_by_email:
            user = authenticate(username=user_by_email.username, password=password)

    if user is not None:
        if not user.is_active:
            return Response({"error": "Tài khoản của bạn đã bị vô hiệu hóa."}, status=status.HTTP_400_BAD_REQUEST)

        # Lấy hoặc tạo token cho user
        token, _ = Token.objects.get_or_create(user=user)
        
        # Trả về thông tin user & token
        return Response({
            "token": token.key,
            "email": user.email,
            "name": user.first_name or user.username,
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Email hoặc mật khẩu không chính xác."}, status=status.HTTP_400_BAD_REQUEST)

