import random
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from api.models import OTP

class AuthService:
    @staticmethod
    def request_otp(email):
        user = User.objects.filter(email=email).first()
        if not user:
            raise ObjectDoesNotExist("Email không tồn tại trong hệ thống.")

        otp_code = f"{random.randint(100000, 999999)}"
        OTP.objects.filter(email=email, is_used=False).update(is_used=True)
        OTP.objects.create(email=email, otp=otp_code)
        
        return user, otp_code

    @staticmethod
    def reset_password(email, otp, new_password):
        if len(new_password) < 6:
            raise ValidationError("Mật khẩu phải chứa ít nhất 6 ký tự.")

        otp_record = OTP.objects.filter(email=email, is_used=False).first()
        if not otp_record or otp_record.otp != otp:
            raise ValidationError("Mã OTP không chính xác hoặc đã được sử dụng trước đó.")

        if otp_record.is_expired():
            otp_record.is_used = True
            otp_record.save()
            raise ValidationError("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.")

        user = User.objects.filter(email=email).first()
        if not user:
            raise ObjectDoesNotExist("Người dùng sở hữu email này không còn tồn tại.")

        user.set_password(new_password)
        user.save()

        otp_record.is_used = True
        otp_record.save()
        return user

    @staticmethod
    def register_user(name, email, password):
        if len(password) < 6:
            raise ValidationError("Mật khẩu phải chứa ít nhất 6 ký tự.")

        if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
            raise ValidationError("Email này đã được đăng ký tài khoản thành viên.")

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name
        )
        return user

    @staticmethod
    def login_user(email, password):
        user = authenticate(username=email, password=password)
        if user is None:
            user_by_email = User.objects.filter(email=email).first()
            if user_by_email:
                user = authenticate(username=user_by_email.username, password=password)

        if user is None:
            raise ValidationError("Email hoặc mật khẩu không chính xác.")

        if not user.is_active:
            raise ValidationError("Tài khoản của bạn đã bị vô hiệu hóa.")

        token, _ = Token.objects.get_or_create(user=user)
        return user, token.key
