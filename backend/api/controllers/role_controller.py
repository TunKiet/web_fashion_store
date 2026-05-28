from django.contrib.auth.models import Group, Permission
from rest_framework import viewsets, status
from rest_framework.response import Response
from api.serializers import GroupSerializer, PermissionSerializer
from api.permissions import HasModelPermission
from api.services import RoleService

class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [HasModelPermission]

    def get_queryset(self):
        return RoleService.get_all_groups()

    def perform_create(self, serializer):
        serializer.instance = RoleService.create_group(serializer.validated_data)

    def perform_update(self, serializer):
        serializer.instance = RoleService.update_group(self.get_object().id, serializer.validated_data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name = RoleService.delete_group(instance.id)
        return Response(
            {"message": f"Đã xóa vai trò '{name}' thành công."},
            status=status.HTTP_200_OK
        )

class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PermissionSerializer
    permission_classes = [HasModelPermission]
    pagination_class = None  # Return all permissions to the frontend without pagination

    def get_queryset(self):
        return RoleService.get_all_permissions()
