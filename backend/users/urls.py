from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import UserViewSet
from .api import me


router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
	# Function-based endpoint for current user info
	path('me/', me, name='me'),

	# ViewSet routes under /users/
	path('', include(router.urls)),
]