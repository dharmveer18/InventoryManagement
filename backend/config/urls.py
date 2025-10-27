from django.contrib import admin
from django.urls import path, include
from users.token_views import CustomTokenObtainPairView, CustomTokenRefreshView

# drf-spectacular imports
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("api/inventory/", include('inventory.urls')),
    path("api/", include('users.urls')),
    path("api/audit-logs/", include('audit.urls')),

    # drf-spectacular schema and docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
