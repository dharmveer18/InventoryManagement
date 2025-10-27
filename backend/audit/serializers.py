from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    actor = serializers.StringRelatedField()
    content_type = serializers.StringRelatedField()
    content_object = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            'id', 'actor', 'action', 'content_type', 'object_id', 'content_object',
            'before_state', 'after_state', 'ip_address', 'user_agent', 'additional_context', 'created_at'
        ]
        read_only_fields = fields

    def get_content_object(self, obj):
        return str(obj.content_object) if obj.content_object else None
