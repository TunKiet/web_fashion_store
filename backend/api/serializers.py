from rest_framework import serializers
from django.contrib.auth.models import User, Group, Permission
from .models import Item, Category, Order, OrderItem

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename']

class GroupSerializer(serializers.ModelSerializer):
    permissions_details = PermissionSerializer(source='permissions', many=True, read_only=True)
    permissions = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Permission.objects.all(),
        required=False
    )
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'permissions_details', 'user_count']

    def get_user_count(self, obj):
        return obj.user_set.count()

class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    groups = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Group.objects.all(),
        required=False
    )
    groups_details = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'is_active', 'is_staff', 'is_superuser', 'date_joined', 
            'password', 'groups', 'groups_details'
        ]
        read_only_fields = ['id', 'date_joined']

    def get_groups_details(self, obj):
        return [{'id': g.id, 'name': g.name} for g in obj.groups.all()]

    def create(self, validated_data):
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

    def update(self, instance, validated_data):
        groups = validated_data.pop('groups', None)
        password = validated_data.pop('password', None)
        
        # Email & Username sync
        email = validated_data.get('email')
        if email:
            validated_data['username'] = email

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
            
        instance.save()
        if groups is not None:
            instance.groups.set(groups)
        return instance

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'item', 'title', 'price', 'quantity', 'selected_size']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_email', 'name', 'phone', 'address', 'city', 'notes',
            'payment_method', 'total_price', 'status', 'created_at', 'updated_at',
            'items'
        ]
        read_only_fields = ['id', 'user', 'user_email', 'total_price', 'created_at', 'updated_at']

    def get_user_email(self, obj):
        return obj.user.email if obj.user else ""
