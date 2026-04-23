from django.contrib import admin
from .models import Goal, GoalMembership, Plan, Session, Milestone

admin.site.register(Goal)
admin.site.register(GoalMembership)
admin.site.register(Plan)
admin.site.register(Session)
admin.site.register(Milestone)
