from django.core.management.base import BaseCommand

from incidents.models import IncidentCategory, Ward

WARDS = [
    ("Intensive Care Unit", "ICU"),
    ("Emergency", "ER"),
    ("General Ward A", "GWA"),
    ("Pediatrics", "PED"),
    ("Maternity", "MAT"),
    ("Operation Theatre", "OT"),
]

CATEGORIES = [
    "Medication error",
    "Patient fall",
    "Allergy missed",
    "Equipment failure",
    "Patient identification",
    "Infection control",
    "Documentation",
    "Other",
]


class Command(BaseCommand):
    help = "Create default wards and incident categories"

    def handle(self, *args, **options):
        for name, code in WARDS:
            Ward.objects.get_or_create(code=code, defaults={"name": name})
        for name in CATEGORIES:
            IncidentCategory.objects.get_or_create(name=name)
        self.stdout.write(self.style.SUCCESS("Reference data ready"))