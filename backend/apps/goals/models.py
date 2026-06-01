import uuid
from django.db import models
from django.conf import settings


class Goal(models.Model):
    class Visibility(models.TextChoices):
        PRIVATE = 'PRIVATE', 'Privat'
        SHARED = 'SHARED', 'Geteilt'
        COLLABORATIVE = 'COLLABORATIVE', 'Kollaborativ'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_goals'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    target_hours = models.FloatField(default=0)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    visibility = models.CharField(
        max_length=15, choices=Visibility.choices, default=Visibility.PRIVATE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class GoalMembership(models.Model):
    class Role(models.TextChoices):
        VIEWER = 'VIEWER', 'Betrachter'
        CONTRIBUTOR = 'CONTRIBUTOR', 'Mitwirkender'

    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='goal_memberships'
    )
    role = models.CharField(max_length=15, choices=Role.choices, default=Role.VIEWER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('goal', 'user')

    def __str__(self):
        return f'{self.user} → {self.goal} ({self.role})'


class Plan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='plans')
    weekly_hours = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Plan für {self.goal}: {self.weekly_hours}h/Woche'


class Session(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='sessions')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions'
    )
    started_at = models.DateTimeField()
    duration_seconds = models.IntegerField(default=0)
    note = models.TextField(blank=True)

    def __str__(self):
        return f'Session {self.id} ({self.duration_seconds}s)'


class Milestone(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Offen'
        DONE = 'DONE', 'Erledigt'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='milestones')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='milestones'
    )
    title = models.CharField(max_length=200)
    target_date = models.DateField(null=True, blank=True)
    note = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)

    def __str__(self):
        return self.title


class RoughPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='rough_plans')
    year = models.IntegerField()
    month = models.IntegerField()
    planned_hours = models.FloatField()
    note = models.TextField(blank=True)

    class Meta:
        unique_together = ('goal', 'year', 'month')

    def __str__(self):
        return f'{self.goal.title} - {self.month}/{self.year}: {self.planned_hours}h'


class TimeSlot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='time_slots')
    date = models.DateField()
    planned_minutes = models.IntegerField()
    note = models.TextField(blank=True)

    def __str__(self):
        return f'{self.goal.title} am {self.date}: {self.planned_minutes}min'
