from django.contrib.auth.models import Group, Permission
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from api.serializers import GroupSerializer, PermissionSerializer

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializer
    permission_classes = [IsAdminUser]

class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    # Only show permissions related to api or auth models for simplicity
    queryset = Permission.objects.filter(
        content_type__app_label__in=['api', 'auth']
    ).order_by('codename')
    serializer_class = PermissionSerializer
    permission_classes = [IsAdminUser]
    pagination_class = None  # Return all permissions to the frontend without pagination
