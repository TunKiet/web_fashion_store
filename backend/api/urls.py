from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.controllers import (
    ItemViewSet, CategoryViewSet, UserViewSet, GroupViewSet, PermissionViewSet,
    request_otp, reset_password, register, login, upload_image
)

router = DefaultRouter()
router.register(r'items', ItemViewSet, basename='item')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'users', UserViewSet, basename='user')
router.register(r'roles', GroupViewSet, basename='role')
router.register(r'permissions', PermissionViewSet, basename='permission')

urlpatterns = [
    path('', include(router.urls)),
    path('upload/', upload_image, name='upload_image'),
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/forgot-password/', request_otp, name='forgot_password'),
    path('auth/reset-password/', reset_password, name='reset_password'),
]