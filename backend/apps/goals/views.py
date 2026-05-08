from django.db.models import Q, Sum
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Goal, GoalMembership, Plan, Session, Milestone
from .permissions import CanAccessGoal, get_user_role
from .serializers import (
    GoalSerializer, GoalListSerializer, MembershipSerializer,
    PlanSerializer, SessionSerializer, MilestoneSerializer,
)


def get_accessible_goals(user):
    return Goal.objects.filter(
        Q(owner=user) |
        Q(memberships__user=user) |
        Q(visibility__in=['SHARED', 'COLLABORATIVE'])
    ).distinct()


class GoalListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        return GoalListSerializer if self.request.method == 'GET' else GoalSerializer

    def get_queryset(self):
        return get_accessible_goals(self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class GoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated, CanAccessGoal]

    def get_queryset(self):
        return get_accessible_goals(self.request.user)

    def destroy(self, request, *args, **kwargs):
        goal = self.get_object()
        if goal.owner != request.user:
            return Response({'detail': 'Nur der Owner kann ein Ziel löschen.'}, status=403)
        return super().destroy(request, *args, **kwargs)


class MemberListCreateView(generics.ListCreateAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_goal(self):
        return generics.get_object_or_404(Goal, pk=self.kwargs['goal_id'])

    def get_queryset(self):
        return GoalMembership.objects.filter(goal=self.get_goal())

    def perform_create(self, serializer):
        goal = self.get_goal()
        if goal.owner != self.request.user:
            raise PermissionDenied('Nur der Owner kann Mitglieder einladen.')
        serializer.save(goal=goal)


class MemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GoalMembership.objects.filter(goal__pk=self.kwargs['goal_id'])

    def get_object(self):
        return generics.get_object_or_404(self.get_queryset(), user__pk=self.kwargs['user_id'])


class SessionListCreateView(generics.ListCreateAPIView):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_goal(self):
        return generics.get_object_or_404(Goal, pk=self.kwargs['goal_id'])

    def get_queryset(self):
        goal = self.get_goal()
        if goal.visibility == 'COLLABORATIVE' and get_user_role(goal, self.request.user):
            return Session.objects.filter(goal=goal)
        return Session.objects.filter(goal=goal, user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(goal=self.get_goal(), user=self.request.user)


class MilestoneListCreateView(generics.ListCreateAPIView):
    serializer_class = MilestoneSerializer
    permission_classes = [IsAuthenticated]

    def get_goal(self):
        return generics.get_object_or_404(Goal, pk=self.kwargs['goal_id'])

    def get_queryset(self):
        return Milestone.objects.filter(goal=self.get_goal())

    def perform_create(self, serializer):
        serializer.save(goal=self.get_goal(), created_by=self.request.user)


class MilestoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MilestoneSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Milestone.objects.filter(goal__pk=self.kwargs['goal_id'])


class PlanListCreateView(generics.ListCreateAPIView):
    serializer_class = PlanSerializer
    permission_classes = [IsAuthenticated]

    def get_goal(self):
        return generics.get_object_or_404(Goal, pk=self.kwargs['goal_id'])

    def get_queryset(self):
        return Plan.objects.filter(goal=self.get_goal())

    def perform_create(self, serializer):
        serializer.save(goal=self.get_goal())


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def goal_stats(request, goal_id):
    goal = generics.get_object_or_404(Goal, pk=goal_id)
    sessions = Session.objects.filter(goal=goal)
    own_seconds = sessions.filter(user=request.user).aggregate(total=Sum('duration_seconds'))['total'] or 0
    total_seconds = sessions.aggregate(total=Sum('duration_seconds'))['total'] or 0
    return Response({
        'goal_id': str(goal.id),
        'own_hours': round(own_seconds / 3600, 2),
        'total_hours': round(total_seconds / 3600, 2),
        'target_hours': goal.target_hours,
        'progress_percent': round((own_seconds / 3600) / goal.target_hours * 100, 1) if goal.target_hours else 0,
        'session_count': sessions.filter(user=request.user).count(),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    goals = get_accessible_goals(request.user)
    result = []
    for goal in goals:
        own_seconds = Session.objects.filter(goal=goal, user=request.user).aggregate(
            total=Sum('duration_seconds')
        )['total'] or 0
        result.append({
            'id': str(goal.id),
            'title': goal.title,
            'visibility': goal.visibility,
            'own_hours': round(own_seconds / 3600, 2),
            'target_hours': goal.target_hours,
            'progress_percent': round((own_seconds / 3600) / goal.target_hours * 100, 1) if goal.target_hours else 0,
            'open_milestones': goal.milestones.filter(status='OPEN').count(),
        })
    return Response(result)
