from django.contrib.auth.models import Group, Permission

class RoleService:
    @staticmethod
    def get_all_groups():
        return Group.objects.all().order_by('name')

    @staticmethod
    def get_all_permissions():
        return Permission.objects.filter(
            content_type__app_label__in=['api', 'auth']
        ).order_by('codename')

    @staticmethod
    def create_group(validated_data):
        permissions = validated_data.pop('permissions', [])
        group = Group.objects.create(**validated_data)
        if permissions:
            group.permissions.set(permissions)
        return group

    @staticmethod
    def update_group(group_id, validated_data):
        permissions = validated_data.pop('permissions', None)
        group = Group.objects.get(pk=group_id)
        for attr, value in validated_data.items():
            setattr(group, attr, value)
        group.save()
        if permissions is not None:
            group.permissions.set(permissions)
        return group

    @staticmethod
    def delete_group(group_id):
        group = Group.objects.get(pk=group_id)
        name = group.name
        group.delete()
        return name
