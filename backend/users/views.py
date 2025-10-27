from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, decorators, response
from django.contrib.auth import get_user_model

User = get_user_model()

from .serializers import UserSerializer
from .models import Roles

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]  # change to IsAuthenticated if you want all users to see

    @decorators.action(detail=False, methods=["get"], url_path="me", permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        return response.Response(self.get_serializer(request.user).data)

    @decorators.action(detail=True, methods=["post"], url_path="set-role", permission_classes=[permissions.IsAdminUser])
    def set_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get("role")
        if role not in [Roles.ADMIN, Roles.MANAGER, Roles.VIEWER]:
            return response.Response({"error": "Invalid role."}, status=400)
        user.role = role
        user.save()
        return response.Response({"status": "role updated", "role": user.role})
