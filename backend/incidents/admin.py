from django.contrib import admin

from .models import (
    ActivityLog,
    Comment,
    CorrectiveAction,
    Incident,
    IncidentCategory,
    Ward,
)


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0


class ActionInline(admin.TabularInline):
    model = CorrectiveAction
    extra = 0


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ("reference", "title", "ward", "category", "severity", "status", "assigned_to", "due_date")
    list_filter = ("status", "severity", "ward", "category")
    search_fields = ("title", "description", "patient_ref")
    inlines = [CommentInline, ActionInline]


admin.site.register(Ward)
admin.site.register(IncidentCategory)
admin.site.register(ActivityLog)