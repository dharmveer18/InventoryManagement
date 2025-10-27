from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "is_staff",
            "date_joined",
            # Add any custom fields here
        ]
        read_only_fields = ["id", "date_joined"]
