from rest_framework import serializers
from apps.users.serializers import UserSerializer
from apps.users.models import User
from .models import Goal, GoalMembership, Plan, Session, Milestone, RoughPlan, TimeSlot


class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        source='user',
        queryset=User.objects.all(),
        write_only=True,
    )

    class Meta:
        model = GoalMembership
        fields = ['id', 'user', 'user_id', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ['id', 'weekly_hours', 'created_at']
        read_only_fields = ['id', 'created_at']


class RoughPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoughPlan
        fields = ['id', 'year', 'month', 'planned_hours', 'note']
        read_only_fields = ['id']


class TimeSlotSerializer(serializers.ModelSerializer):
    goal_title = serializers.ReadOnlyField(source='goal.title')
    
    class Meta:
        model = TimeSlot
        fields = ['id', 'goal', 'goal_title', 'date', 'planned_minutes', 'note']
        read_only_fields = ['id', 'goal_title']


class SessionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    goal_title = serializers.ReadOnlyField(source='goal.title')

    class Meta:
        model = Session
        fields = ['id', 'user', 'goal', 'goal_title', 'started_at', 'duration_seconds', 'note']
        read_only_fields = ['id', 'user', 'goal_title']


class MilestoneSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Milestone
        fields = ['id', 'created_by', 'title', 'target_date', 'note', 'status']
        read_only_fields = ['id', 'created_by']


class GoalSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    memberships = MembershipSerializer(many=True, read_only=True)
    plans = PlanSerializer(many=True, read_only=True)
    rough_plans = RoughPlanSerializer(many=True, read_only=True)
    time_slots = TimeSlotSerializer(many=True, read_only=True)
    milestones = MilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = Goal
        fields = [
            'id', 'owner', 'title', 'description', 'target_hours',
            'start_date', 'end_date', 'visibility', 'created_at',
            'memberships', 'plans', 'rough_plans', 'time_slots', 'milestones',
        ]
        read_only_fields = ['id', 'owner', 'created_at']


class GoalListSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Goal
        fields = ['id', 'owner', 'title', 'target_hours', 'start_date', 'end_date', 'visibility', 'created_at']
        read_only_fields = ['id', 'owner', 'created_at']
