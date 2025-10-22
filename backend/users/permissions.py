from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.contrib.auth.models import AnonymousUser
from users.models import Roles

ROLE_ORDER = {Roles.VIEWER: 1, Roles.MANAGER: 2, Roles.ADMIN: 3}

def role_level(user):
    if isinstance(user, AnonymousUser): return 0
    if getattr(user, "is_superuser", False): return 99
    return ROLE_ORDER.get(getattr(user, "role", None), 0)

class RoleAtLeast(BasePermission):
    required = 0
    def has_permission(self, request, view):
        return request.user.is_authenticated and role_level(request.user) >= self.required

class IsViewerOrReadOnly(RoleAtLeast):
    required = ROLE_ORDER[Roles.VIEWER]
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return super().has_permission(request, view)
        return role_level(request.user) >= ROLE_ORDER[Roles.MANAGER]

class IsManagerOrAbove(RoleAtLeast):
    required = ROLE_ORDER[Roles.MANAGER]

class IsAdmin(RoleAtLeast):
    required = ROLE_ORDER[Roles.ADMIN]

class RequireModelPerm(BasePermission):
    """Combine with RoleAtLeast; leverages Django's Group perms."""
    required_perms = []  # ["inventory.change_item"]
    def has_permission(self, request, view):
        return request.user.is_authenticated and all(request.user.has_perm(p) for p in self.required_perms)
# class IsAdminOrHasModelPerm(RequireModelPerm):
#     required_perms = []  # ["inventory.change_item"]
#     def has_permission(self, request, view):
#         if request.user.is_authenticated and (request.user.is_superuser or request.user.is_staff):
#             return True
#         return super().has_permission(request, view)