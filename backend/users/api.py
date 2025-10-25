
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers
from drf_spectacular.utils import extend_schema


class MeSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    role = serializers.CharField()
    perms = serializers.ListField(child=serializers.CharField())

@extend_schema(responses=MeSerializer)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    data = {
        "id": u.id,
        "username": u.username,
        "role": getattr(u, "role", ""),
        "perms": list(u.get_all_permissions()),
    }
    return Response(data)
