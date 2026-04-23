from datetime import date, datetime, timedelta
from uuid import uuid4

from src.types.app_state import AppState
from src.types.goal import LearningGoal
from src.types.session import StudySession
from src.types.plan import MonthPlan, TimeSlot
from src.logic.reminder import last_activity, is_inactive, get_reminders, INACTIVITY_THRESHOLD

def make_goal():
    return LearningGoal(
        id=uuid4(),
        title="Test Goal",
        description="",
        target_hours=100.0,
        start_date=date(2025, 1, 1),
        end_date=date(2025, 6, 30),
    )

def make_session(dt: datetime):
    return StudySession(
        id=uuid4(),
        goal_id=uuid4(),
        started_at=dt - timedelta(hours=1),
        ended_at=dt,
        duration_seconds=3600,
    )

def test_last_activity_empty():
    state = AppState()
    assert last_activity(state) is None

def test_last_activity_with_sessions():
    dt1 = datetime(2025, 3, 1, 10, 0)
    dt2 = datetime(2025, 3, 1, 15, 0)
    dt3 = datetime(2025, 3, 1, 12, 0)
    state = AppState(
        sessions=(
            make_session(dt1),
            make_session(dt2),
            make_session(dt3),
        )
    )
    assert last_activity(state) == dt2

def test_is_inactive_no_sessions_no_goals():
    state = AppState()
    now = datetime(2025, 3, 2, 12, 0)
    assert not is_inactive(state, now)

def test_is_inactive_no_sessions_with_goals():
    state = AppState(goals=(make_goal(),))
    now = datetime(2025, 3, 2, 12, 0)
    assert is_inactive(state, now)

def test_is_inactive_active():
    dt = datetime(2025, 3, 1, 15, 0)
    state = AppState(sessions=(make_session(dt),), goals=(make_goal(),))
    now = dt + INACTIVITY_THRESHOLD - timedelta(hours=1)
    assert not is_inactive(state, now)

def test_is_inactive_inactive():
    dt = datetime(2025, 3, 1, 15, 0)
    state = AppState(sessions=(make_session(dt),), goals=(make_goal(),))
    now = dt + INACTIVITY_THRESHOLD + timedelta(hours=1)
    assert is_inactive(state, now)

def test_get_reminders_no_reminders():
    dt = datetime(2025, 3, 1, 15, 0)
    state = AppState(sessions=(make_session(dt),), goals=(make_goal(),))
    now = dt + timedelta(hours=5)
    reminders = get_reminders(state, now)
    assert reminders == []

def test_get_reminders_inactive_no_sessions():
    state = AppState(goals=(make_goal(),))
    now = datetime(2025, 3, 2, 12, 0)
    reminders = get_reminders(state, now)
    assert "Du hast noch keine Lernzeit erfasst. Starte jetzt!" in reminders
    assert len(reminders) == 1

def test_get_reminders_inactive_with_sessions():
    dt = datetime(2025, 3, 1, 15, 0)
    state = AppState(sessions=(make_session(dt),), goals=(make_goal(),))
    now = dt + timedelta(hours=26)
    reminders = get_reminders(state, now)
    expected = "Du hast seit 26 Stunden nicht gelernt. Zeit für eine Lerneinheit?"
    assert expected in reminders
    assert len(reminders) == 1

def test_get_reminders_missed_slots():
    dt = datetime(2025, 3, 1, 15, 0)
    goal = make_goal()
    month_plan = MonthPlan(
        goal_id=goal.id,
        year=2025,
        month=2,
        slots=(
            TimeSlot(date=date(2025, 2, 28), planned_minutes=60),
            TimeSlot(date=date(2025, 2, 27), planned_minutes=60),
        )
    )
    state = AppState(
        goals=(goal,),
        sessions=(make_session(dt),),
        month_plans=(month_plan,)
    )
    now = dt + timedelta(hours=5)
    reminders = get_reminders(state, now)
    expected = "2 geplante Lerneinheit(en) wurden nicht erledigt."
    assert expected in reminders
    assert len(reminders) == 1

def test_get_reminders_multiple():
    dt = datetime(2025, 3, 1, 15, 0)
    goal = make_goal()
    month_plan = MonthPlan(
        goal_id=goal.id,
        year=2025,
        month=2,
        slots=(
            TimeSlot(date=date(2025, 2, 28), planned_minutes=60),
            TimeSlot(date=date(2025, 2, 27), planned_minutes=60),
        )
    )
    state = AppState(
        goals=(goal,),
        sessions=(make_session(dt),),
        month_plans=(month_plan,)
    )
    now = dt + timedelta(hours=30)
    reminders = get_reminders(state, now)
    assert len(reminders) == 2
    assert "Du hast seit 30 Stunden nicht gelernt. Zeit für eine Lerneinheit?" in reminders
    assert "2 geplante Lerneinheit(en) wurden nicht erledigt." in reminders
