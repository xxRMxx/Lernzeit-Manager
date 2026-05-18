from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Goal, GoalMembership


def get_user_role(goal, user):
    if goal.owner == user:
        return 'OWNER'
    membership = goal.memberships.filter(user=user).first()
    return membership.role if membership else None


class CanAccessGoal(BasePermission):
    def has_object_permission(self, request, view, obj):
        goal = obj if isinstance(obj, Goal) else obj.goal
        role = get_user_role(goal, request.user)
        if role:
            return True
        if goal.visibility in ('SHARED', 'COLLABORATIVE') and request.method in SAFE_METHODS:
            return True
        return False


class IsGoalOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        goal = obj if isinstance(obj, Goal) else obj.goal
        return goal.owner == request.user
