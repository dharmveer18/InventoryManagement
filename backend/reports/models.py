from django.db import models
from django.conf import settings

class ReportDefinition(models.Model):
    """Defines available report types and their configurations"""
    REPORT_FORMATS = [
        ('csv', 'CSV'),
        ('pdf', 'PDF'),
        ('json', 'JSON'),
    ]

    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    format = models.CharField(max_length=10, choices=REPORT_FORMATS)
    config = models.JSONField(default=dict, blank=True,
                            help_text='Configuration parameters, templates, etc.')
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class ReportRun(models.Model):
    """Tracks individual report generation attempts"""
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('running', 'Running'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]

    definition = models.ForeignKey(ReportDefinition, on_delete=models.PROTECT, related_name='runs')
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='report_runs'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    parameters = models.JSONField(default=dict, blank=True,
                                help_text='Parameters used for this report run')
    
    # Timing fields
    requested_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    
    # Error tracking
    error_message = models.TextField(blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['definition', 'requested_at']),
            models.Index(fields=['status']),
        ]
        ordering = ['-requested_at']

    def __str__(self):
        return f"{self.definition.name} - {self.requested_at}"

class ReportArtifact(models.Model):
    """Stores generated report files"""
    report_run = models.ForeignKey(ReportRun, on_delete=models.CASCADE, related_name='artifacts')
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100)
    size_bytes = models.PositiveBigIntegerField()
    checksum = models.CharField(max_length=64, blank=True,
                              help_text='SHA-256 checksum of the file')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['report_run']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.file_name
