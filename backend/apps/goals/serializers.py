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
        required=False
    )
    email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = GoalMembership
        fields = ['id', 'user', 'user_id', 'email', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']

    def validate(self, data):
        email = data.pop('email', None)
        if email:
            try:
                data['user'] = User.objects.get(email=email)
            except User.DoesNotExist:
                raise serializers.ValidationError({"email": "Ein Benutzer mit dieser E-Mail existiert nicht."})
        
        if not data.get('user'):
            raise serializers.ValidationError("Benutzer oder E-Mail ist erforderlich.")
        
        # Check if already member (only for creation)
        if not self.instance:
            goal_id = self.context['view'].kwargs.get('goal_id')
            if goal_id and GoalMembership.objects.filter(goal_id=goal_id, user=data['user']).exists():
                raise serializers.ValidationError({"email": "Dieser Benutzer ist bereits Mitglied dieses Lernziels."})
            
        return data


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
        fields = ['id', 'goal', 'goal_title', 'date', 'planned_minutes', 'note', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'goal_title', 'created_at', 'updated_at']


class SessionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    goal_title = serializers.ReadOnlyField(source='goal.title')
    goal = serializers.PrimaryKeyRelatedField(queryset=Goal.objects.all(), required=False)
    timeslot = serializers.PrimaryKeyRelatedField(queryset=TimeSlot.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Session
        fields = ['id', 'user', 'goal', 'timeslot', 'goal_title', 'started_at', 'duration_seconds', 'note', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'goal_title', 'created_at', 'updated_at']


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
    own_hours = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = [
            'id', 'owner', 'title', 'description', 'target_hours',
            'start_date', 'end_date', 'visibility', 'created_at', 'updated_at',
            'memberships', 'plans', 'rough_plans', 'time_slots', 'milestones',
            'own_hours', 'progress_percent'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

    def get_own_hours(self, obj):
        seconds = getattr(obj, 'own_seconds', 0)
        return round(seconds / 3600, 2)

    def get_progress_percent(self, obj):
        if not obj.target_hours:
            return 0
        seconds = getattr(obj, 'own_seconds', 0)
        return round((seconds / 3600) / obj.target_hours * 100, 1)


class GoalListSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    own_hours = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = [
            'id', 'owner', 'title', 'target_hours', 'start_date', 'end_date',
            'visibility', 'created_at', 'updated_at', 'own_hours', 'progress_percent'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

    def get_own_hours(self, obj):
        seconds = getattr(obj, 'own_seconds', 0)
        return round(seconds / 3600, 2)

    def get_progress_percent(self, obj):
        if not obj.target_hours:
            return 0
        seconds = getattr(obj, 'own_seconds', 0)
        return round((seconds / 3600) / obj.target_hours * 100, 1)
