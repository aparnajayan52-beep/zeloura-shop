from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """Anyone can read a product; only the user who created it (or staff) can change/delete it."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author_id == request.user.id or request.user.is_staff
class IsStaffOrReadOnly(permissions.BasePermission):
    """Anyone can browse. Only staff (shop admins) can add products."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)