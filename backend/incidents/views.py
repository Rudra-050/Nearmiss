from datetime import datetime

from django.db import transaction
from django.db.models import Avg, Count, DurationField, ExpressionWrapper, F
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import (
    IsAdminOrReadOnly,
    IsManagerOrAdmin,
    IsReviewer,
    is_admin,
    is_reviewer,
)

from .filters import IncidentFilter
from .models import ActivityLog, Comment, CorrectiveAction, Incident, IncidentCategory, Ward
from .serializers import (
    AssignSerializer,
    CategorySerializer,
    CommentSerializer,
    CorrectiveActionSerializer,
    IncidentCreateSerializer,
    IncidentDetailSerializer,
    IncidentListSerializer,
    TransitionSerializer,
    WardSerializer,
)
from .services import log_event

DETAIL_PREFETCH = ("comments__author", "actions__owner", "activity__actor")


class IncidentViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    filterset_class = IncidentFilter
    search_fields = ("title", "description")
    ordering_fields = ("created_at", "occurred_at", "due_date", "severity", "status")
    ordering = ("-created_at",)

    def scoped_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Incident.objects.none()
        qs = Incident.objects.select_related("ward", "category", "reporter", "assigned_to")
        if not is_reviewer(self.request.user):
            qs = qs.filter(reporter=self.request.user)
        return qs

    def get_queryset(self):
        qs = self.scoped_queryset()
        if self.action == "retrieve":
            qs = qs.prefetch_related(*DETAIL_PREFETCH)
        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return IncidentCreateSerializer
        if self.action == "retrieve":
            return IncidentDetailSerializer
        return IncidentListSerializer

    def detail_response(self, incident, http_status=status.HTTP_200_OK):
        fresh = self.scoped_queryset().prefetch_related(*DETAIL_PREFETCH).get(pk=incident.pk)
        data = IncidentDetailSerializer(fresh, context=self.get_serializer_context()).data
        return Response(data, status=http_status)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            incident = serializer.save(reporter=request.user)
            log_event(incident, request.user, ActivityLog.Event.CREATED, to_value=incident.status)
        return self.detail_response(incident, status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="comments")
    def add_comment(self, request, pk=None):
        incident = self.get_object()
        serializer = CommentSerializer(data=request.data, context=self.get_serializer_context())
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            serializer.save(incident=incident, author=request.user)
            log_event(incident, request.user, ActivityLog.Event.COMMENTED)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="actions", permission_classes=[IsReviewer])
    def add_action(self, request, pk=None):
        incident = self.get_object()
        if incident.status == "CLOSED":
            raise ValidationError("Reopen the incident before adding actions.")
        serializer = CorrectiveActionSerializer(
            data=request.data, context=self.get_serializer_context()
        )
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            item = serializer.save(incident=incident)
            log_event(
                incident, request.user, ActivityLog.Event.ACTION_ADDED,
                to_value=item.description[:100],
            )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[IsReviewer])
    def transition(self, request, pk=None):
        incident = self.get_object()
        serializer = TransitionSerializer(
            data=request.data, context={**self.get_serializer_context(), "incident": incident}
        )
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data["status"]
        with transaction.atomic():
            old_status = incident.status
            incident.status = new_status
            incident.closed_at = timezone.now() if new_status == "CLOSED" else None
            incident.save(update_fields=["status", "closed_at", "updated_at"])
            log_event(
                incident, request.user, ActivityLog.Event.STATUS_CHANGED,
                from_value=old_status, to_value=new_status,
            )
        return self.detail_response(incident)

    @action(detail=True, methods=["post"], permission_classes=[IsManagerOrAdmin])
    def assign(self, request, pk=None):
        incident = self.get_object()
        if incident.status == "CLOSED":
            raise ValidationError("Reopen the incident before reassigning it.")
        serializer = AssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignee = serializer.validated_data["assigned_to"]
        with transaction.atomic():
            incident.assigned_to = assignee
            fields = ["assigned_to", "updated_at"]
            if "due_date" in serializer.validated_data:
                incident.due_date = serializer.validated_data["due_date"]
                fields.append("due_date")
            incident.save(update_fields=fields)
            log_event(
                incident, request.user, ActivityLog.Event.ASSIGNED,
                to_value=assignee.get_full_name() or assignee.username,
            )
        return self.detail_response(incident)


class CorrectiveActionViewSet(mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = CorrectiveAction.objects.select_related("incident", "owner")
    serializer_class = CorrectiveActionSerializer
    permission_classes = [IsReviewer]
    http_method_names = ["patch", "options"]

    def perform_update(self, serializer):
        was_done = serializer.instance.is_done
        item = serializer.save()
        if item.is_done != was_done:
            item.completed_at = timezone.now() if item.is_done else None
            item.save(update_fields=["completed_at"])
            if item.is_done:
                log_event(
                    item.incident, self.request.user, ActivityLog.Event.ACTION_DONE,
                    to_value=item.description[:100],
                )


class WardViewSet(viewsets.ModelViewSet):
    serializer_class = WardSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None
    search_fields = ("name", "code")
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        qs = Ward.objects.all()
        if not is_admin(self.request.user):
            qs = qs.filter(is_active=True)
        return qs


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None
    search_fields = ("name",)
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        qs = IncidentCategory.objects.all()
        if not is_admin(self.request.user):
            qs = qs.filter(is_active=True)
        return qs


class DashboardStatsView(APIView):
    permission_classes = [IsReviewer]

    def get(self, request):
        today = timezone.localdate()
        qs = Incident.objects.all()
        open_qs = qs.exclude(status="CLOSED")

        avg = qs.filter(closed_at__isnull=False).aggregate(
            avg=Avg(ExpressionWrapper(F("closed_at") - F("created_at"), output_field=DurationField()))
        )["avg"]

        def fill(field, choices):
            found = {r[field]: r["count"] for r in qs.values(field).annotate(count=Count("id"))}
            return [
                {"value": value, "label": label, "count": found.get(value, 0)}
                for value, label in choices
            ]

        def grouped(field, key):
            rows = qs.values(field).annotate(count=Count("id")).order_by("-count")
            return [{key: r[field], "count": r["count"]} for r in rows]

        y, m = today.year, today.month - 11
        while m <= 0:
            m += 12
            y -= 1
        start = timezone.make_aware(datetime(y, m, 1))
        rows = {
            r["month"].strftime("%Y-%m"): r["count"]
            for r in qs.filter(created_at__gte=start)
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"))
        }
        monthly = []
        for _ in range(12):
            monthly.append({"month": f"{y}-{m:02d}", "count": rows.get(f"{y}-{m:02d}", 0)})
            m += 1
            if m > 12:
                m, y = 1, y + 1

        return Response(
            {
                "total": qs.count(),
                "open": open_qs.count(),
                "closed": qs.filter(status="CLOSED").count(),
                "overdue": open_qs.filter(due_date__lt=today).count(),
                "unassigned": open_qs.filter(assigned_to__isnull=True).count(),
                "avg_days_to_close": round(avg.total_seconds() / 86400, 1) if avg else None,
                "by_severity": fill("severity", Incident.Severity.choices),
                "by_status": fill("status", Incident.Status.choices),
                "by_ward": grouped("ward__name", "ward"),
                "by_category": grouped("category__name", "category"),
                "monthly": monthly,
            }
        )