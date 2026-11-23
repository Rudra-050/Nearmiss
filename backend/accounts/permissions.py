from rest_framework.permissions import SAFE_METHODS, BasePermission

REVIEWER_ROLES = ("MANAGER", "INVESTIGATOR", "ADMIN")
MANAGER_ROLES = ("MANAGER", "ADMIN")


def _role(user):
    if user and user.is_authenticated:
        return getattr(user, "role", None)
    return None


def is_reviewer(user):
    return _role(user) in REVIEWER_ROLES


def is_manager(user):
    return _role(user) in MANAGER_ROLES


def is_admin(user):
    return _role(user) == "ADMIN"


class IsReviewer(BasePermission):
    def has_permission(self, request, view):
        return is_reviewer(request.user)


class IsManagerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return is_manager(request.user)


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user)


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return is_admin(request.user)