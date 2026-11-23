import re

from django.utils import timezone
from rest_framework import serializers

from accounts.models import User
from accounts.permissions import REVIEWER_ROLES, is_manager, is_reviewer

from .models import (
    ActivityLog,
    Comment,
    CorrectiveAction,
    Incident,
    IncidentCategory,
    Ward,
)
from .services import TRANSITIONS


def person_name(user, incident, viewer):
    """Name to show for a user, hiding the reporter of an anonymous incident."""
    if user is None:
        return "Unknown"
    if (
        incident.is_anonymous
        and user.pk == incident.reporter_id
        and (viewer is None or viewer.pk != user.pk)
    ):
        return "Anonymous"
    return user.get_full_name() or user.username


class WardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ward
        fields = ("id", "name", "code", "is_active")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentCategory
        fields = ("id", "name", "is_active")


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ("id", "author_name", "body", "created_at")
        read_only_fields = ("id", "author_name", "created_at")

    def get_author_name(self, obj):
        viewer = self.context["request"].user
        return person_name(obj.author, obj.incident, viewer)


class CorrectiveActionSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_active=True, role__in=REVIEWER_ROLES),
        required=False,
        allow_null=True,
    )
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = CorrectiveAction
        fields = (
            "id",
            "description",
            "owner",
            "owner_name",
            "due_date",
            "is_done",
            "completed_at",
            "created_at",
        )
        read_only_fields = ("id", "completed_at", "created_at")

    def get_owner_name(self, obj):
        if obj.owner is None:
            return None
        return obj.owner.get_full_name() or obj.owner.username


class ActivityLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()
    event_label = serializers.CharField(source="get_event_display", read_only=True)

    class Meta:
        model = ActivityLog
        fields = (
            "id",
            "event",
            "event_label",
            "actor_name",
            "from_value",
            "to_value",
            "created_at",
        )

    def get_actor_name(self, obj):
        viewer = self.context["request"].user
        return person_name(obj.actor, obj.incident, viewer)


LIST_FIELDS = (
    "id",
    "reference",
    "title",
    "severity",
    "status",
    "occurred_at",
    "created_at",
    "due_date",
    "is_overdue",
    "is_anonymous",
    "ward",
    "ward_name",
    "category",
    "category_name",
    "assigned_to",
    "assigned_to_name",
    "reporter_name",
)

DETAIL_FIELDS = (
    "id",
    "reference",
    "title",
    "description",
    "severity",
    "status",
    "occurred_at",
    "created_at",
    "closed_at",
    "due_date",
    "is_overdue",
    "is_anonymous",
    "patient_ref",
    "ward",
    "ward_name",
    "category",
    "category_name",
    "assigned_to",
    "assigned_to_name",
    "reporter_name",
    "allowed_transitions",
    "comments",
    "actions",
    "activity",
)


class IncidentListSerializer(serializers.ModelSerializer):
    ward_name = serializers.CharField(source="ward.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    assigned_to_name = serializers.SerializerMethodField()
    reporter_name = serializers.SerializerMethodField()

    class Meta:
        model = Incident
        fields = LIST_FIELDS

    def get_assigned_to_name(self, obj):
        if obj.assigned_to is None:
            return None
        return obj.assigned_to.get_full_name() or obj.assigned_to.username

    def get_reporter_name(self, obj):
        return person_name(obj.reporter, obj, self.context["request"].user)


class IncidentDetailSerializer(IncidentListSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    actions = CorrectiveActionSerializer(many=True, read_only=True)
    activity = ActivityLogSerializer(many=True, read_only=True)
    allowed_transitions = serializers.SerializerMethodField()

    class Meta:
        model = Incident
        fields = DETAIL_FIELDS

    def get_allowed_transitions(self, obj):
        user = self.context["request"].user
        if not is_reviewer(user):
            return []
        options = TRANSITIONS.get(obj.status, [])
        if not is_manager(user):
            # Only managers and admins can close or reopen an incident.
            if obj.status == "CLOSED":
                return []
            options = [o for o in options if o != "CLOSED"]
        return options


class IncidentCreateSerializer(serializers.ModelSerializer):
    ward = serializers.PrimaryKeyRelatedField(
        queryset=Ward.objects.filter(is_active=True)
    )
    category = serializers.PrimaryKeyRelatedField(
        queryset=IncidentCategory.objects.filter(is_active=True)
    )

    class Meta:
        model = Incident
        fields = (
            "title",
            "description",
            "occurred_at",
            "ward",
            "category",
            "severity",
            "patient_ref",
            "is_anonymous",
        )

    def validate_description(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Describe what happened in at least 10 characters."
            )
        return value.strip()

    def validate_occurred_at(self, value):
        if value > timezone.now():
            raise serializers.ValidationError(
                "The incident time can't be in the future."
            )
        return value

    def validate_patient_ref(self, value):
        if value and not re.fullmatch(r"[A-Za-z0-9_-]{1,50}", value):
            raise serializers.ValidationError(
                "Use a de-identified ID (letters, numbers, - and _ only). "
                "Never enter a patient's name."
            )
        return value


class TransitionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Incident.Status.choices)

    def validate_status(self, new):
        incident = self.context["incident"]
        user = self.context["request"].user
        labels = dict(Incident.Status.choices)

        if new not in TRANSITIONS.get(incident.status, []):
            raise serializers.ValidationError(
                f"Can't move from {labels[incident.status]} to {labels[new]}."
            )
        if "CLOSED" in (new, incident.status) and not is_manager(user):
            raise serializers.ValidationError(
                "Only a manager or admin can close or reopen an incident."
            )
        if new == "ACTION_TAKEN" and not incident.actions.exists():
            raise serializers.ValidationError(
                "Add at least one corrective action first."
            )
        if new == "CLOSED" and incident.actions.filter(is_done=False).exists():
            raise serializers.ValidationError(
                "Complete all corrective actions before closing."
            )
        return new


class AssignSerializer(serializers.Serializer):
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_active=True, role__in=REVIEWER_ROLES)
    )
    due_date = serializers.DateField(required=False, allow_null=True)

    def validate_due_date(self, value):
        if value and value < timezone.localdate():
            raise serializers.ValidationError("The due date can't be in the past.")
        return value