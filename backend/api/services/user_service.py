from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class UserService:
    @staticmethod
    def get_all_users():
        return User.objects.all().order_by('-date_joined')

    @staticmethod
    def create_user(validated_data):
        groups = validated_data.pop('groups', [])
        password = validated_data.pop('password', None)
        email = validated_data.get('email', '')
        if email and not validated_data.get('username'):
            validated_data['username'] = email

        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        if groups:
            user.groups.set(groups)
        return user

    @staticmethod
    def update_user(user_id, validated_data):
        groups = validated_data.pop('groups', None)
        password = validated_data.pop('password', None)
        email = validated_data.get('email')
        
        user = User.objects.get(pk=user_id)
        if email:
            validated_data['username'] = email

        for attr, value in validated_data.items():
            setattr(user, attr, value)

        if password:
            user.set_password(password)

        user.save()
        if groups is not None:
            user.groups.set(groups)
        return user

    @staticmethod
    def delete_user(user_id, current_user):
        user_to_delete = User.objects.get(pk=user_id)
        if user_to_delete == current_user:
            raise ValidationError("Bạn không thể tự xóa tài khoản của chính mình.")
        
        username = user_to_delete.username
        user_to_delete.delete()
        return username
