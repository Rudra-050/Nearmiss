import django_filters
from django.utils import timezone

from .models import Incident


class IncidentFilter(django_filters.FilterSet):
    overdue = django_filters.BooleanFilter(method="filter_overdue")
    mine = django_filters.BooleanFilter(method="filter_mine")
    assigned_to_me = django_filters.BooleanFilter(method="filter_assigned_to_me")
    occurred_after = django_filters.DateTimeFilter(field_name="occurred_at", lookup_expr="gte")
    occurred_before = django_filters.DateTimeFilter(field_name="occurred_at", lookup_expr="lte")

    class Meta:
        model = Incident
        fields = ["status", "severity", "ward", "category", "assigned_to"]

    def filter_overdue(self, queryset, name, value):
        if value:
            return queryset.exclude(status="CLOSED").filter(due_date__lt=timezone.localdate())
        return queryset

    def filter_mine(self, queryset, name, value):
        if value:
            return queryset.filter(reporter=self.request.user)
        return queryset

    def filter_assigned_to_me(self, queryset, name, value):
        if value:
            return queryset.filter(assigned_to=self.request.user)
        return queryset