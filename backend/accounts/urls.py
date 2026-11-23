from django.urls import include, path
from rest_framework.routers import SimpleRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import AdminUserViewSet, AssignableUsersView, LoginView, MeView

router = SimpleRouter()
router.register("users", AdminUserViewSet, basename="user")

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("users/assignable/", AssignableUsersView.as_view(), name="assignable-users"),
    path("", include(router.urls)),
]