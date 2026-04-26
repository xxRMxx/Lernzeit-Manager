from datetime import datetime, date
from uuid import uuid4

from src.types.app_state import AppState
from src.types.goal import LearningGoal
from src.types.milestone import Milestone
from src.store.reducer import reduce
from src.store.actions import (
    AddGoal, UpdateGoalStatus, RemoveGoal,
    AddMilestone, AchieveMilestone, RemoveMilestone,
    SetActiveView
)

def test_reduce_add_goal():
    state = AppState()
    goal = LearningGoal(id=uuid4(), title="Test", description="", target_hours=10, start_date=date.today(), end_date=date.today())
    new_state = reduce(state, AddGoal(goal=goal))
    assert len(new_state.goals) == 1
    assert new_state.goals[0].title == "Test"

def test_reduce_update_goal_status():
    gid = uuid4()
    goal = LearningGoal(id=gid, title="Test", description="", status="active", target_hours=10, start_date=date.today(), end_date=date.today())
    state = AppState(goals=(goal,))
    new_state = reduce(state, UpdateGoalStatus(goal_id=gid, status="completed"))
    assert new_state.goals[0].status == "completed"

def test_reduce_remove_goal():
    gid = uuid4()
    goal = LearningGoal(id=gid, title="Test", description="", target_hours=10, start_date=date.today(), end_date=date.today())
    state = AppState(goals=(goal,))
    new_state = reduce(state, RemoveGoal(goal_id=gid))
    assert len(new_state.goals) == 0

def test_reduce_add_milestone():
    state = AppState()
    gid = uuid4()
    ms = Milestone(id=uuid4(), goal_id=gid, title="M1", milestone_type="custom", target_date=date.today())
    new_state = reduce(state, AddMilestone(milestone=ms))
    assert len(new_state.milestones) == 1
    assert new_state.milestones[0].title == "M1"

def test_reduce_achieve_milestone():
    mid = uuid4()
    ms = Milestone(id=mid, goal_id=uuid4(), title="M1", milestone_type="custom", status="planned", target_date=date.today())
    state = AppState(milestones=(ms,))
    today = date.today()
    new_state = reduce(state, AchieveMilestone(milestone_id=mid, achieved_at=today))
    assert new_state.milestones[0].status == "achieved"
    assert new_state.milestones[0].achieved_at == today

def test_reduce_remove_milestone():
    mid = uuid4()
    ms = Milestone(id=mid, goal_id=uuid4(), title="M1", milestone_type="custom", target_date=date.today())
    state = AppState(milestones=(ms,))
    new_state = reduce(state, RemoveMilestone(milestone_id=mid))
    assert len(new_state.milestones) == 0

def test_reduce_set_active_view():
    state = AppState(active_view="dashboard")
    new_state = reduce(state, SetActiveView(view_name="goals"))
    assert new_state.active_view == "goals"
