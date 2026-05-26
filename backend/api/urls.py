from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.controllers import ItemViewSet, CategoryViewSet, request_otp, reset_password, register, login

router = DefaultRouter()
router.register(r'items', ItemViewSet)
router.register(r'categories', CategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/forgot-password/', request_otp, name='forgot_password'),
    path('auth/reset-password/', reset_password, name='reset_password'),
]