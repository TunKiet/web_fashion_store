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

    @classmethod
    def send_2fa_login_otp(cls, user):
        import random
        from api.models import OTP
        from django.core.mail import send_mail
        from django.conf import settings

        otp_code = f"{random.randint(100000, 999999)}"
        OTP.objects.filter(email=user.email, is_used=False).update(is_used=True)
        OTP.objects.create(email=user.email, otp=otp_code)

        subject = "[The K Luxury] Mã xác thực 2FA đăng nhập"
        message = (
            f"Chào {user.first_name or user.username or 'quý khách'},\n\n"
            f"Có một yêu cầu đăng nhập vào tài khoản của bạn tại The K Luxury yêu cầu xác thực 2 lớp.\n"
            f"Mã OTP xác thực 2FA của bạn là: {otp_code}\n"
            f"Mã này có hiệu lực trong vòng 5 phút.\n\n"
            f"Nếu bạn không thực hiện yêu cầu này, vui lòng đổi mật khẩu ngay lập tức để bảo vệ tài khoản.\n\n"
            f"Trân trọng,\nThe K Luxury Editorial Team."
        )
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@thekluxury.com')
        send_mail(subject, message, from_email, [user.email], fail_silently=False)

    @classmethod
    def send_2fa_setup_otp(cls, user):
        import random
        from api.models import OTP
        from django.core.mail import send_mail
        from django.conf import settings

        otp_code = f"{random.randint(100000, 999999)}"
        OTP.objects.filter(email=user.email, is_used=False).update(is_used=True)
        OTP.objects.create(email=user.email, otp=otp_code)

        subject = "[The K Luxury] Mã OTP xác nhận cấu hình 2FA"
        message = (
            f"Chào {user.first_name or user.username or 'quý khách'},\n\n"
            f"Bạn đang thực hiện thay đổi cài đặt bảo mật Xác thực 2 lớp (2FA) cho tài khoản tại The K Luxury.\n"
            f"Mã OTP xác nhận của bạn là: {otp_code}\n"
            f"Mã này có hiệu lực trong vòng 5 phút.\n\n"
            f"Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.\n\n"
            f"Trân trọng,\nThe K Luxury Editorial Team."
        )
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@thekluxury.com')
        send_mail(subject, message, from_email, [user.email], fail_silently=False)

    @staticmethod
    def verify_2fa_otp(email, code):
        from api.models import OTP
        otp_record = OTP.objects.filter(email=email, is_used=False).first()
        if not otp_record or otp_record.otp != code:
            return False
        
        if otp_record.is_expired():
            otp_record.is_used = True
            otp_record.save()
            return False

        otp_record.is_used = True
        otp_record.save()
        return True

    @classmethod
    def login_user(cls, email, password, code=None):
        user = authenticate(username=email, password=password)
        if user is None:
            user_by_email = User.objects.filter(email=email).first()
            if user_by_email:
                user = authenticate(username=user_by_email.username, password=password)

        if user is None:
            raise ValidationError("Email hoặc mật khẩu không chính xác.")

        if not user.is_active:
            raise ValidationError("Tài khoản của bạn đã bị vô hiệu hóa.")

        # Kiểm tra Xác thực 2 lớp (2FA)
        from api.models.user_2fa import User2FA
        two_factor = User2FA.objects.filter(user=user, is_enabled=True).first()
        if two_factor:
            if not code:
                cls.send_2fa_login_otp(user)
                raise ValidationError("2fa_required")
            
            if not cls.verify_2fa_otp(user.email, code):
                raise ValidationError("Mã xác thực 2FA không chính xác.")

        token, _ = Token.objects.get_or_create(user=user)
        return user, token.key
