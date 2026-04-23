from dataclasses import FrozenInstanceError
from datetime import date, datetime
from uuid import uuid4
import pytest

from src.store.actions import (
    AddGoal, UpdateGoalStatus, RemoveGoal,
    StartStopwatch, PauseStopwatch, ResumeStopwatch, StopStopwatch,
    SetRoughPlanEntry, AddTimeSlot, RemoveTimeSlot,
    AddMilestone, AchieveMilestone, RemoveMilestone,
    RemoveSession, SetActiveView
)
from src.types.goal import LearningGoal
from src.types.plan import RoughPlanEntry, TimeSlot
from src.types.milestone import Milestone

def make_goal():
    return LearningGoal(
        id=uuid4(),
        title="Test Goal",
        description="Description",
        target_hours=10.0,
        start_date=date.today(),
        end_date=date.today()
    )

def make_rough_plan_entry():
    return RoughPlanEntry(
        goal_id=uuid4(),
        year=2023,
        month=10,
        planned_hours=5.0
    )

def make_time_slot():
    return TimeSlot(
        date=date.today(),
        planned_minutes=60
    )

def make_milestone():
    return Milestone(
        id=uuid4(),
        goal_id=uuid4(),
        title="Test Milestone",
        milestone_type="custom",
        target_date=date.today()
    )

def test_add_goal():
    goal = make_goal()
    action = AddGoal(goal=goal)
    assert action.goal == goal
    with pytest.raises(FrozenInstanceError):
        action.goal = make_goal()

def test_update_goal_status():
    goal_id = uuid4()
    action = UpdateGoalStatus(goal_id=goal_id, status="completed")
    assert action.goal_id == goal_id
    assert action.status == "completed"
    with pytest.raises(FrozenInstanceError):
        action.status = "abandoned"

def test_remove_goal():
    goal_id = uuid4()
    action = RemoveGoal(goal_id=goal_id)
    assert action.goal_id == goal_id
    with pytest.raises(FrozenInstanceError):
        action.goal_id = uuid4()

def test_start_stopwatch():
    goal_id = uuid4()
    now = datetime.now()
    action = StartStopwatch(goal_id=goal_id, now=now)
    assert action.goal_id == goal_id
    assert action.now == now
    with pytest.raises(FrozenInstanceError):
        action.now = datetime.now()

def test_pause_stopwatch():
    now = datetime.now()
    action = PauseStopwatch(now=now)
    assert action.now == now
    with pytest.raises(FrozenInstanceError):
        action.now = datetime.now()

def test_resume_stopwatch():
    now = datetime.now()
    action = ResumeStopwatch(now=now)
    assert action.now == now
    with pytest.raises(FrozenInstanceError):
        action.now = datetime.now()

def test_stop_stopwatch():
    now = datetime.now()
    action = StopStopwatch(now=now, note="test", rating=5)
    assert action.now == now
    assert action.note == "test"
    assert action.rating == 5
    with pytest.raises(FrozenInstanceError):
        action.rating = 4

def test_set_rough_plan_entry():
    entry = make_rough_plan_entry()
    action = SetRoughPlanEntry(entry=entry)
    assert action.entry == entry
    with pytest.raises(FrozenInstanceError):
        action.entry = make_rough_plan_entry()

def test_add_time_slot():
    goal_id = uuid4()
    slot = make_time_slot()
    action = AddTimeSlot(goal_id=goal_id, year=2023, month=10, slot=slot)
    assert action.goal_id == goal_id
    assert action.year == 2023
    assert action.month == 10
    assert action.slot == slot
    with pytest.raises(FrozenInstanceError):
        action.year = 2024

def test_remove_time_slot():
    goal_id = uuid4()
    slot_date = date.today()
    action = RemoveTimeSlot(goal_id=goal_id, year=2023, month=10, slot_date=slot_date)
    assert action.goal_id == goal_id
    assert action.year == 2023
    assert action.month == 10
    assert action.slot_date == slot_date
    with pytest.raises(FrozenInstanceError):
        action.month = 11

def test_add_milestone():
    milestone = make_milestone()
    action = AddMilestone(milestone=milestone)
    assert action.milestone == milestone
    with pytest.raises(FrozenInstanceError):
        action.milestone = make_milestone()

def test_achieve_milestone():
    milestone_id = uuid4()
    achieved_at = date.today()
    action = AchieveMilestone(milestone_id=milestone_id, achieved_at=achieved_at)
    assert action.milestone_id == milestone_id
    assert action.achieved_at == achieved_at
    with pytest.raises(FrozenInstanceError):
        action.achieved_at = date.today()

def test_remove_milestone():
    milestone_id = uuid4()
    action = RemoveMilestone(milestone_id=milestone_id)
    assert action.milestone_id == milestone_id
    with pytest.raises(FrozenInstanceError):
        action.milestone_id = uuid4()

def test_remove_session():
    session_id = uuid4()
    action = RemoveSession(session_id=session_id)
    assert action.session_id == session_id
    with pytest.raises(FrozenInstanceError):
        action.session_id = uuid4()

def test_set_active_view():
    action = SetActiveView(view_name="dashboard")
    assert action.view_name == "dashboard"
    with pytest.raises(FrozenInstanceError):
        action.view_name = "settings"
