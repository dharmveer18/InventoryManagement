
from rest_framework import viewsets
from .models import AuditLog
from .serializers import AuditLogSerializer
from rest_framework.permissions import IsAdminUser

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
	queryset = AuditLog.objects.all()
	serializer_class = AuditLogSerializer
	permission_classes = [IsAdminUser]
