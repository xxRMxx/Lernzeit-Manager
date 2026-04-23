from rest_framework import serializers
from apps.users.serializers import UserSerializer
from apps.users.models import User
from .models import Goal, GoalMembership, Plan, Session, Milestone


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


class SessionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Session
        fields = ['id', 'user', 'started_at', 'duration_seconds', 'note']
        read_only_fields = ['id', 'user']


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
    milestones = MilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = Goal
        fields = [
            'id', 'owner', 'title', 'description', 'target_hours',
            'start_date', 'end_date', 'visibility', 'created_at',
            'memberships', 'plans', 'milestones',
        ]
        read_only_fields = ['id', 'owner', 'created_at']


class GoalListSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Goal
        fields = ['id', 'owner', 'title', 'target_hours', 'start_date', 'end_date', 'visibility', 'created_at']
        read_only_fields = ['id', 'owner', 'created_at']
