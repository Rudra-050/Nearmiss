from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        REPORTER = "REPORTER", "Reporter"
        MANAGER = "MANAGER", "Manager"
        INVESTIGATOR = "INVESTIGATOR", "Investigator"
        ADMIN = "ADMIN", "Admin"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.REPORTER)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"