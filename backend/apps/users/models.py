from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        USER = 'USER', 'Benutzer'
        ADMIN = 'ADMIN', 'Administrator'

    username = None
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=100, blank=True)
    avatar_url = models.URLField(blank=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.USER)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class UserPreferences(models.Model):
    """User preferences for notifications and other settings."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    learning_reminders_enabled = models.BooleanField(default=True)
    weekly_report_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "User Preferences"

    def __str__(self):
        return f"Preferences for {self.user.email}"
