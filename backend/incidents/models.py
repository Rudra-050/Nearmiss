from django.conf import settings
from django.db import models
from django.utils import timezone


class Ward(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class IncidentCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "incident categories"

    def __str__(self):
        return self.name


class Incident(models.Model):
    class Severity(models.TextChoices):
        NEAR_MISS = "NEAR_MISS", "Near-miss"
        NO_HARM = "NO_HARM", "No harm"
        MINOR = "MINOR", "Minor"
        SERIOUS = "SERIOUS", "Serious"

    class Status(models.TextChoices):
        REPORTED = "REPORTED", "Reported"
        UNDER_REVIEW = "UNDER_REVIEW", "Under review"
        INVESTIGATING = "INVESTIGATING", "Investigating"
        ACTION_TAKEN = "ACTION_TAKEN", "Action taken"
        CLOSED = "CLOSED", "Closed"

    title = models.CharField(max_length=200)
    description = models.TextField()
    occurred_at = models.DateTimeField()
    ward = models.ForeignKey(Ward, on_delete=models.PROTECT, related_name="incidents")
    category = models.ForeignKey(
        IncidentCategory, on_delete=models.PROTECT, related_name="incidents"
    )
    severity = models.CharField(max_length=20, choices=Severity.choices)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.REPORTED
    )
    patient_ref = models.CharField(
        max_length=50,
        blank=True,
        help_text="Fictional or de-identified patient ID only. Never a real name.",
    )
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reported_incidents",
    )
    is_anonymous = models.BooleanField(default=False)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_incidents",
    )
    due_date = models.DateField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["severity"]),
            models.Index(fields=["ward", "category"]),
        ]

    def __str__(self):
        return f"{self.reference} {self.title}"

    @property
    def reference(self):
        if not self.pk:
            return ""
        return f"NM-{self.created_at:%Y}-{self.pk:05d}"

    @property
    def is_overdue(self):
        return (
            self.due_date is not None
            and self.status != self.Status.CLOSED
            and self.due_date < timezone.localdate()
        )


class Comment(models.Model):
    incident = models.ForeignKey(
        Incident, on_delete=models.CASCADE, related_name="comments"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


class CorrectiveAction(models.Model):
    incident = models.ForeignKey(
        Incident, on_delete=models.CASCADE, related_name="actions"
    )
    description = models.TextField()
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="corrective_actions",
    )
    due_date = models.DateField(null=True, blank=True)
    is_done = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


class ActivityLog(models.Model):
    class Event(models.TextChoices):
        CREATED = "CREATED", "Created"
        STATUS_CHANGED = "STATUS_CHANGED", "Status changed"
        ASSIGNED = "ASSIGNED", "Assigned"
        COMMENTED = "COMMENTED", "Commented"
        ACTION_ADDED = "ACTION_ADDED", "Action added"
        ACTION_DONE = "ACTION_DONE", "Action completed"

    incident = models.ForeignKey(
        Incident, on_delete=models.CASCADE, related_name="activity"
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )
    event = models.CharField(max_length=20, choices=Event.choices)
    from_value = models.CharField(max_length=100, blank=True)
    to_value = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]