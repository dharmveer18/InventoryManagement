from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class Roles(models.TextChoices):
    ADMIN = "admin", "Admin"
    MANAGER = "manager", "Manager"
    VIEWER = "viewer", "Viewer"

class User(AbstractUser):
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.VIEWER)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login_at = models.DateTimeField(null=True)
    modified_at = models.DateTimeField(auto_now=True)

    @property
    def is_admin(self): return self.role == Roles.ADMIN
    @property
    def is_manager(self): return self.role == Roles.MANAGER
    @property
    def is_viewer(self): return self.role == Roles.VIEWER
    