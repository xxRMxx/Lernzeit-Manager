from django.contrib import admin
from .models import Goal, GoalMembership, Plan, Session, Milestone, RoughPlan, TimeSlot


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'target_hours', 'visibility', 'created_at']
    list_filter = ['visibility']
    search_fields = ['title', 'owner__email']
    raw_id_fields = ['owner']


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['goal', 'user', 'started_at', 'duration_seconds', 'status']
    list_filter = ['status']
    search_fields = ['user__email', 'goal__title']
    raw_id_fields = ['user', 'goal']


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['goal', 'date', 'planned_minutes', 'status']
    list_filter = ['status']
    search_fields = ['goal__title', 'goal__owner__email']


admin.site.register(GoalMembership)
admin.site.register(Plan)
admin.site.register(Milestone)
admin.site.register(RoughPlan)
