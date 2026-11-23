from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import (
    CategoryViewSet,
    CorrectiveActionViewSet,
    DashboardStatsView,
    IncidentViewSet,
    WardViewSet,
)

router = SimpleRouter()
router.register("incidents", IncidentViewSet, basename="incident")
router.register("actions", CorrectiveActionViewSet, basename="action")
router.register("wards", WardViewSet, basename="ward")
router.register("categories", CategoryViewSet, basename="category")

urlpatterns = [
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("", include(router.urls)),
]