from rest_framework.permissions import BasePermission, SAFE_METHODS

class HasModelPermission(BasePermission):
    def has_permission(self, request, view):
        # Determine the model name from the view's queryset or serializer_class
        model_cls = None
        if hasattr(view, 'get_queryset'):
            try:
                model_cls = view.get_queryset().model
            except Exception:
                pass
        if not model_cls and hasattr(view, 'serializer_class') and view.serializer_class:
            model_cls = view.serializer_class.Meta.model

        if not model_cls:
            return False

        app_label = model_cls._meta.app_label
        model_name = model_cls._meta.model_name
        is_safe = request.method in SAFE_METHODS

        # 1. Allow Anyone to view products and categories on the storefront
        if model_name in ['item', 'category'] and is_safe:
            return True

        # 2. For all other operations, user must be authenticated, active, and staff/superuser
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        if not request.user.is_staff:
            return False

        # Map HTTP methods / DRF actions to Django permissions
        action = ''
        if request.method == 'POST':
            action = 'add'
        elif request.method in ['PUT', 'PATCH']:
            action = 'change'
        elif request.method == 'DELETE':
            action = 'delete'
        elif request.method in SAFE_METHODS:
            action = 'view'

        # Special DRF actions (e.g. custom router actions like 'restore', 'force_delete')
        if hasattr(view, 'action'):
            if view.action in ['restore', 'force_delete']:
                action = 'delete'

        # Django permissions use format: <app_label>.<action>_<model_name>
        perm_string = f"{app_label}.{action}_{model_name}"

        # check permission against user roles (Groups)
        return request.user.has_perm(perm_string)
