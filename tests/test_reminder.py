from datetime import date, datetime, timedelta
from uuid import uuid4

from src.types.app_state import AppState
from src.types.goal import LearningGoal
from src.types.session import StudySession
from src.types.plan import MonthPlan, TimeSlot
from src.logic.reminder import last_activity, get_reminders, is_inactive, INACTIVITY_THRESHOLD

def make_session(goal_id=None, dt=None, duration=3600) -> StudySession:
    dt = dt or datetime(2025, 3, 1, 10, 0)
    return StudySession(
        id=uuid4(),
        goal_id=goal_id or uuid4(),
        started_at=dt - timedelta(seconds=duration),
        ended_at=dt,
        duration_seconds=duration
    )

def make_goal(gid=None) -> LearningGoal:
    return LearningGoal(
        id=gid or uuid4(),
        title="Test Goal",
        description="",
        target_hours=100.0,
        start_date=date(2025, 1, 1),
        end_date=date(2025, 12, 31)
    )

def make_month_plan(goal_id, year, month, slots):
    return MonthPlan(
        goal_id=goal_id,
        year=year,
        month=month,
        slots=tuple(slots),
    )

def make_time_slot(dt, minutes=60):
    return TimeSlot(
        date=dt,
        planned_minutes=minutes,
    )

# --- Lower Level Logic Tests ---

def test_last_activity_empty():
    assert last_activity(AppState()) is None

def test_last_activity_with_sessions():
    dt1 = datetime(2025, 3, 1, 10, 0)
    dt2 = datetime(2025, 3, 1, 15, 0)
    dt3 = datetime(2025, 3, 1, 12, 0)
    state = AppState(
        sessions=(
            make_session(dt=dt1),
            make_session(dt=dt2),
            make_session(dt=dt3),
        )
    )
    assert last_activity(state) == dt2

def test_is_inactive_no_sessions_no_goals():
    state = AppState(sessions=(), goals=())
    now = datetime(2025, 3, 2, 12, 0)
    assert not is_inactive(state, now)

def test_is_inactive_no_sessions_with_goals():
    state = AppState(sessions=(), goals=(make_goal(),))
    now = datetime(2025, 3, 2, 12, 0)
    assert is_inactive(state, now)

def test_is_inactive_active():
    dt = datetime(2025, 3, 1, 15, 0)
    state = AppState(sessions=(make_session(dt=dt),), goals=(make_goal(),))
    now = dt + INACTIVITY_THRESHOLD - timedelta(hours=1)
    assert not is_inactive(state, now)

def test_is_inactive_exactly_at_threshold():
    dt = datetime(2025, 3, 1, 15, 0)
    now = dt + INACTIVITY_THRESHOLD
    state = AppState(sessions=(make_session(dt=dt),), goals=(make_goal(),))
    assert not is_inactive(state, now)

def test_is_inactive_inactive():
    dt = datetime(2025, 3, 1, 15, 0)
    state = AppState(sessions=(make_session(dt=dt),), goals=(make_goal(),))
    now = dt + INACTIVITY_THRESHOLD + timedelta(hours=1)
    assert is_inactive(state, now)

# --- Reminder Integration Tests ---

def test_get_reminders_no_goals():
    state = AppState(goals=())
    now = datetime(2025, 3, 15, 10, 0)
    assert get_reminders(state, now) == []

def test_get_reminders_inactive_no_sessions():
    state = AppState(goals=(make_goal(),), sessions=())
    now = datetime(2025, 3, 15, 10, 0)
    reminders = get_reminders(state, now)
    assert "Du hast noch keine Lernzeit erfasst. Starte jetzt!" in reminders
    assert len(reminders) == 1

def test_get_reminders_inactive_with_sessions():
    goal = make_goal()
    now = datetime(2025, 3, 15, 10, 0)
    # Session war vor 30 Stunden
    last_session_time = now - timedelta(hours=30)
    session = make_session(goal.id, last_session_time)

    state = AppState(goals=(goal,), sessions=(session,))
    reminders = get_reminders(state, now)

    expected = "Du hast seit 30 Stunden nicht gelernt. Zeit für eine Lerneinheit?"
    assert expected in reminders
    assert len(reminders) == 1

def test_get_reminders_active_with_sessions():
    goal = make_goal()
    now = datetime(2025, 3, 15, 10, 0)
    # Session war vor 10 Stunden (weniger als 24h Threshold)
    last_session_time = now - timedelta(hours=10)
    session = make_session(goal.id, last_session_time)

    state = AppState(goals=(goal,), sessions=(session,))
    reminders = get_reminders(state, now)

    assert reminders == []

def test_get_reminders_missed_slots():
    goal = make_goal()
    now = datetime(2025, 3, 15, 10, 0)

    # 2 overdue slots
    slot1 = make_time_slot(date(2025, 3, 10))
    slot2 = make_time_slot(date(2025, 3, 12))
    # 1 future slot (not overdue)
    slot3 = make_time_slot(date(2025, 3, 20))

    month_plan = make_month_plan(goal.id, 2025, 3, [slot1, slot2, slot3])

    # Session on a different date so slots are not fulfilled
    session = make_session(goal.id, now - timedelta(hours=10))

    state = AppState(
        goals=(goal,),
        sessions=(session,),
        month_plans=(month_plan,)
    )

    reminders = get_reminders(state, now)
    assert "2 geplante Lerneinheit(en) wurden nicht erledigt." in reminders
    assert len(reminders) == 1

def test_get_reminders_combined():
    goal = make_goal()
    now = datetime(2025, 3, 15, 10, 0)

    # Session war vor 30 Stunden (Inactive)
    last_session_time = now - timedelta(hours=30)
    session = make_session(goal.id, last_session_time)

    # 1 overdue slot
    slot1 = make_time_slot(date(2025, 3, 10))
    month_plan = make_month_plan(goal.id, 2025, 3, [slot1])

    state = AppState(
        goals=(goal,),
        sessions=(session,),
        month_plans=(month_plan,)
    )

    reminders = get_reminders(state, now)
    assert len(reminders) == 2
    assert "Du hast seit 30 Stunden nicht gelernt. Zeit für eine Lerneinheit?" in reminders
    assert "1 geplante Lerneinheit(en) wurden nicht erledigt." in reminders
