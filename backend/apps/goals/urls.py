from django.urls import path
from . import views

urlpatterns = [
    path('goals/', views.GoalListCreateView.as_view(), name='goal-list'),
    path('goals/<uuid:pk>/', views.GoalDetailView.as_view(), name='goal-detail'),
    path('goals/<uuid:goal_id>/members/', views.MemberListCreateView.as_view(), name='member-list'),
    path('goals/<uuid:goal_id>/members/<int:user_id>/', views.MemberDetailView.as_view(), name='member-detail'),
    path('goals/<uuid:goal_id>/sessions/', views.SessionListCreateView.as_view(), name='session-list'),
    path('goals/<uuid:goal_id>/milestones/', views.MilestoneListCreateView.as_view(), name='milestone-list'),
    path('goals/<uuid:goal_id>/milestones/<uuid:pk>/', views.MilestoneDetailView.as_view(), name='milestone-detail'),
    path('goals/<uuid:goal_id>/plans/', views.PlanListCreateView.as_view(), name='plan-list'),
    path('goals/<uuid:goal_id>/stats/', views.goal_stats, name='goal-stats'),
    path('dashboard/', views.dashboard, name='dashboard'),
]
