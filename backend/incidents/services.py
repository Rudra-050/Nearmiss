from .models import ActivityLog

TRANSITIONS = {
    "REPORTED": ["UNDER_REVIEW"],
    "UNDER_REVIEW": ["INVESTIGATING", "CLOSED"],
    "INVESTIGATING": ["ACTION_TAKEN", "UNDER_REVIEW"],
    "ACTION_TAKEN": ["CLOSED", "INVESTIGATING"],
    "CLOSED": ["UNDER_REVIEW"],
}


def log_event(incident, actor, event, from_value="", to_value=""):
    return ActivityLog.objects.create(
        incident=incident,
        actor=actor,
        event=event,
        from_value=from_value,
        to_value=to_value,
    )