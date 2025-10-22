from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, decorators, response
from django.contrib.auth import get_user_model

User = get_user_model()

from rest_framework.serializers import ModelSerializer
class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "is_staff", "date_joined")

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]  # change to IsAuthenticated if you want all users to see

    @decorators.action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        return response.Response(self.get_serializer(request.user).data)

from django.contrib.auth.decorators import login_required
from django.shortcuts import render

@login_required
def dashboard(request):
    user = request.user
    context = {
        "can_manage_team": user.has_perm("yourapp.change_employee"),
        "can_view_reports": user.has_perm("yourapp.view_report"),
        "is_admin": user.is_superuser or user.is_staff,
    }
    return render(request, "dashboard.html", context)
