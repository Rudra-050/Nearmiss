from rest_framework import generics, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .permissions import REVIEWER_ROLES, IsAdminRole, IsReviewer
from .serializers import AdminUserSerializer, NearMissTokenSerializer, UserSerializer


class LoginView(TokenObtainPairView):
    serializer_class = NearMissTokenSerializer


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class AssignableUsersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsReviewer]
    pagination_class = None

    def get_queryset(self):
        return User.objects.filter(
            is_active=True, role__in=REVIEWER_ROLES
        ).order_by("first_name", "username")


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.order_by("username")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ("role", "is_active")
    search_fields = ("username", "email", "first_name", "last_name")
    http_method_names = ["get", "post", "patch", "head", "options"]