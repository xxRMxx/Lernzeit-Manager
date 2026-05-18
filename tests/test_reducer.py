from datetime import date, datetime
from uuid import uuid4

import pytest

from src.types.app_state import AppState
from src.types.goal import LearningGoal
from src.types.plan import RoughPlanEntry, MonthPlan, TimeSlot
from src.types.session import StudySession, StopwatchState
from src.types.milestone import Milestone
from src.store.actions import (
    AddGoal, UpdateGoalStatus, RemoveGoal,
    StartStopwatch, PauseStopwatch, ResumeStopwatch, StopStopwatch,
    SetRoughPlanEntry, AddTimeSlot, RemoveTimeSlot,
    AddMilestone, AchieveMilestone, RemoveMilestone,
    RemoveSession, SetActiveView
)
from src.store.reducer import reduce


# --- Factory Functions ---

def make_goal(title="Test Goal"):
    return LearningGoal(
        id=uuid4(),
        title=title,
        description="A test goal",
        target_hours=100.0,
        start_date=date(2025, 1, 1),
        end_date=date(2025, 12, 31),
        status="active"
    )

def make_milestone(goal_id):
    return Milestone(
        id=uuid4(),
        goal_id=goal_id,
        title="Test Milestone",
        milestone_type="custom",
        target_date=date(2025, 12, 31)
    )

def make_rough_plan(goal_id, year=2025, month=1):
    return RoughPlanEntry(goal_id=goal_id, year=year, month=month, planned_hours=10)

def make_time_slot(slot_date=date(2025, 1, 1)):
    return TimeSlot(date=slot_date, planned_minutes=60)

def make_session(goal_id):
    return StudySession(
        id=uuid4(),
        goal_id=goal_id,
        started_at=datetime.now(),
        ended_at=datetime.now(),
        duration_seconds=3600
    )


# --- Fixtures ---

@pytest.fixture
def initial_state():
    return AppState()

# --- Goal Actions ---

def test_add_goal(initial_state):
    goal = make_goal()
    action = AddGoal(goal=goal)
    new_state = reduce(initial_state, action)
    assert len(new_state.goals) == 1
    assert new_state.goals[0] == goal

def test_update_goal_status(initial_state):
    goal1 = make_goal("Goal 1")
    goal2 = make_goal("Goal 2")
    state = AppState(goals=(goal1, goal2))

    action = UpdateGoalStatus(goal_id=goal1.id, status="completed")
    new_state = reduce(state, action)

    assert len(new_state.goals) == 2
    assert new_state.goals[0].status == "completed"
    assert new_state.goals[1].status == "active"

def test_remove_goal(initial_state):
    goal1 = make_goal("Goal 1")
    goal2 = make_goal("Goal 2")
    state = AppState(goals=(goal1, goal2))

    action = RemoveGoal(goal_id=goal1.id)
    new_state = reduce(state, action)

    assert len(new_state.goals) == 1
    assert new_state.goals[0].id == goal2.id

# --- Navigation & Fallback ---

def test_set_active_view(initial_state):
    action = SetActiveView(view_name="planning")
    new_state = reduce(initial_state, action)
    assert new_state.active_view == "planning"

def test_unknown_action(initial_state):
    # Testing fallback case _:
    class DummyAction:
        pass

    action = DummyAction()
    new_state = reduce(initial_state, action)
    assert new_state is initial_state

# --- Stopwatch Actions ---

def test_start_stopwatch(initial_state):
    goal_id = uuid4()
    now = datetime(2025, 1, 1, 10, 0, 0)
    action = StartStopwatch(goal_id=goal_id, now=now)
    new_state = reduce(initial_state, action)

    assert new_state.stopwatch.phase == "running"
    assert new_state.stopwatch.goal_id == goal_id
    assert new_state.stopwatch.started_at == now

def test_pause_stopwatch(initial_state):
    goal_id = uuid4()
    t0 = datetime(2025, 1, 1, 10, 0, 0)
    t1 = datetime(2025, 1, 1, 10, 5, 0) # 5 minutes running

    running_sw = StopwatchState(phase="running", goal_id=goal_id, started_at=t0)
    state = AppState(stopwatch=running_sw)

    action = PauseStopwatch(now=t1)
    new_state = reduce(state, action)

    assert new_state.stopwatch.phase == "paused"
    assert new_state.stopwatch.accumulated_seconds == 300

def test_resume_stopwatch(initial_state):
    goal_id = uuid4()
    t1 = datetime(2025, 1, 1, 10, 10, 0)

    paused_sw = StopwatchState(phase="paused", goal_id=goal_id, accumulated_seconds=300)
    state = AppState(stopwatch=paused_sw)

    action = ResumeStopwatch(now=t1)
    new_state = reduce(state, action)

    assert new_state.stopwatch.phase == "running"
    assert new_state.stopwatch.started_at == t1
    assert new_state.stopwatch.accumulated_seconds == 300

def test_stop_stopwatch_creates_session(initial_state):
    goal_id = uuid4()
    t0 = datetime(2025, 1, 1, 10, 0, 0)
    t1 = datetime(2025, 1, 1, 10, 30, 0) # 30 minutes

    running_sw = StopwatchState(phase="running", goal_id=goal_id, started_at=t0)
    state = AppState(stopwatch=running_sw)

    action = StopStopwatch(now=t1, note="Great session", rating=5)
    new_state = reduce(state, action)

    assert new_state.stopwatch.phase == "idle"
    assert len(new_state.sessions) == 1

    session = new_state.sessions[0]
    assert session.goal_id == goal_id
    assert session.duration_seconds == 1800
    assert session.note == "Great session"

def test_stop_idle_stopwatch(initial_state):
    t1 = datetime(2025, 1, 1, 10, 30, 0)

    action = StopStopwatch(now=t1)
    new_state = reduce(initial_state, action)

    assert new_state.stopwatch.phase == "idle"
    assert len(new_state.sessions) == 0


# --- Planning Actions ---

def test_set_rough_plan_entry(initial_state):
    goal_id = uuid4()
    entry1 = make_rough_plan(goal_id, 2025, 1)

    # Add first entry
    action1 = SetRoughPlanEntry(entry=entry1)
    state1 = reduce(initial_state, action1)

    assert len(state1.rough_plans) == 1
    assert state1.rough_plans[0] == entry1

    # Replace existing entry
    entry2 = RoughPlanEntry(goal_id=goal_id, year=2025, month=1, planned_hours=20)
    action2 = SetRoughPlanEntry(entry=entry2)
    state2 = reduce(state1, action2)

    assert len(state2.rough_plans) == 1
    assert state2.rough_plans[0] == entry2

def test_add_time_slot_new_month_plan(initial_state):
    goal_id = uuid4()
    slot_date = date(2025, 1, 15)
    slot = make_time_slot(slot_date)

    action = AddTimeSlot(goal_id=goal_id, year=2025, month=1, slot=slot)
    new_state = reduce(initial_state, action)

    assert len(new_state.month_plans) == 1
    plan = new_state.month_plans[0]
    assert plan.goal_id == goal_id
    assert plan.year == 2025
    assert plan.month == 1
    assert len(plan.slots) == 1
    assert plan.slots[0] == slot

def test_add_time_slot_existing_month_plan(initial_state):
    goal_id = uuid4()
    slot1 = make_time_slot(date(2025, 1, 10))
    slot2 = make_time_slot(date(2025, 1, 15))

    plan = MonthPlan(goal_id=goal_id, year=2025, month=1, slots=(slot1,))
    state = AppState(month_plans=(plan,))

    action = AddTimeSlot(goal_id=goal_id, year=2025, month=1, slot=slot2)
    new_state = reduce(state, action)

    assert len(new_state.month_plans) == 1
    updated_plan = new_state.month_plans[0]
    assert len(updated_plan.slots) == 2

    # Replacing existing slot for same date
    slot2_updated = TimeSlot(date=date(2025, 1, 15), planned_minutes=120)
    action_update = AddTimeSlot(goal_id=goal_id, year=2025, month=1, slot=slot2_updated)
    new_state2 = reduce(new_state, action_update)

    final_plan = new_state2.month_plans[0]
    assert len(final_plan.slots) == 2
    assert final_plan.slots[1].planned_minutes == 120

def test_remove_time_slot(initial_state):
    goal_id = uuid4()
    d1 = date(2025, 1, 10)
    d2 = date(2025, 1, 15)
    slot1 = make_time_slot(d1)
    slot2 = make_time_slot(d2)

    plan = MonthPlan(goal_id=goal_id, year=2025, month=1, slots=(slot1, slot2))
    state = AppState(month_plans=(plan,))

    action = RemoveTimeSlot(goal_id=goal_id, year=2025, month=1, slot_date=d1)
    new_state = reduce(state, action)

    assert len(new_state.month_plans) == 1
    updated_plan = new_state.month_plans[0]
    assert len(updated_plan.slots) == 1
    assert updated_plan.slots[0] == slot2

# --- Milestone Actions ---

def test_add_milestone(initial_state):
    ms = make_milestone(uuid4())
    action = AddMilestone(milestone=ms)
    new_state = reduce(initial_state, action)

    assert len(new_state.milestones) == 1
    assert new_state.milestones[0] == ms

def test_achieve_milestone(initial_state):
    ms1 = make_milestone(uuid4())
    state = AppState(milestones=(ms1,))

    achieve_date = date(2025, 1, 1)
    action = AchieveMilestone(milestone_id=ms1.id, achieved_at=achieve_date)
    new_state = reduce(state, action)

    assert len(new_state.milestones) == 1
    assert new_state.milestones[0].status == "achieved"
    assert new_state.milestones[0].achieved_at == achieve_date

def test_remove_milestone(initial_state):
    ms1 = make_milestone(uuid4())
    ms2 = make_milestone(uuid4())
    state = AppState(milestones=(ms1, ms2))

    action = RemoveMilestone(milestone_id=ms1.id)
    new_state = reduce(state, action)

    assert len(new_state.milestones) == 1
    assert new_state.milestones[0] == ms2

# --- Session Actions ---

def test_remove_session(initial_state):
    s1 = make_session(uuid4())
    s2 = make_session(uuid4())
    state = AppState(sessions=(s1, s2))

    action = RemoveSession(session_id=s1.id)
    new_state = reduce(state, action)

    assert len(new_state.sessions) == 1
    assert new_state.sessions[0] == s2
