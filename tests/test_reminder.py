from datetime import datetime, date, timedelta
from uuid import uuid4

from src.types.app_state import AppState
from src.types.goal import LearningGoal
from src.types.session import StudySession
from src.types.plan import MonthPlan, TimeSlot
from src.logic.reminder import last_activity, get_reminders, is_inactive, INACTIVITY_THRESHOLD

def make_session(ended_at: datetime) -> StudySession:
    return StudySession(
        id=uuid4(),
        goal_id=uuid4(),
        started_at=ended_at - timedelta(hours=1),
        ended_at=ended_at,
        duration_seconds=3600
    )

def make_goal(gid=None) -> LearningGoal:
    return LearningGoal(
        id=gid or uuid4(),
        title="Test Goal",
        description="",
        target_hours=10.0,
        start_date=datetime.now().date(),
        end_date=(datetime.now() + timedelta(days=30)).date()
    )

def test_last_activity():
    gid = uuid4()
    # Empty sessions
    assert last_activity(AppState()) is None
    
    # One session
    t1 = datetime(2025, 1, 1, 12, 0)
    s1 = StudySession(id=uuid4(), goal_id=gid, started_at=datetime(2025, 1, 1, 10, 0), ended_at=t1, duration_seconds=7200)
    assert last_activity(AppState(sessions=(s1,))) == t1
    
    # Multiple sessions
    t2 = datetime(2025, 1, 2, 12, 0)
    s2 = StudySession(id=uuid4(), goal_id=gid, started_at=datetime(2025, 1, 2, 10, 0), ended_at=t2, duration_seconds=7200)
    assert last_activity(AppState(sessions=(s1, s2))) == t2

def test_get_reminders_active_session():
    # If a session was recently ended (< 24h), no "long time no see" reminder
    gid = uuid4()
    now = datetime(2025, 1, 2, 12, 0)
    s1 = StudySession(id=uuid4(), goal_id=gid, started_at=datetime(2025, 1, 2, 10, 0), ended_at=datetime(2025, 1, 2, 11, 0), duration_seconds=3600)
    state = AppState(sessions=(s1,))
    
    reminders = get_reminders(state, now)
    assert not any("nicht gelernt" in r for r in reminders)

def test_get_reminders_inactive_threshold():
    gid = uuid4()
    now = datetime(2025, 1, 3, 12, 0) # Over 24h since s1 ended
    s1 = StudySession(id=uuid4(), goal_id=gid, started_at=datetime(2025, 1, 1, 10, 0), ended_at=datetime(2025, 1, 1, 11, 0), duration_seconds=3600)
    # Need at least one goal to trigger inactivity reminder if sessions exist
    goal = make_goal(gid=gid)
    state = AppState(goals=(goal,), sessions=(s1,))
    
    reminders = get_reminders(state, now)
    assert any("Stunden nicht gelernt" in r for r in reminders)

def test_get_reminders_overdue_slot():
    gid = uuid4()
    # Slot is on Jan 2nd
    slot = TimeSlot(date=date(2025, 1, 2), planned_minutes=120)
    # Now is Jan 3rd, so Jan 2nd is overdue
    now = datetime(2025, 1, 3, 15, 0)
    plan = MonthPlan(goal_id=gid, year=2025, month=1, slots=(slot,))
    state = AppState(month_plans=(plan,))
    
    reminders = get_reminders(state, now)
    assert any("geplante Lerneinheit" in r for r in reminders)

# Tests from main branch for is_inactive logic
def test_is_inactive_no_sessions_no_goals():
    state = AppState(sessions=(), goals=())
    now = datetime(2025, 1, 1, 12, 0)
    assert not is_inactive(state, now)

def test_is_inactive_no_sessions_with_goals():
    goal = make_goal()
    state = AppState(sessions=(), goals=(goal,))
    now = datetime(2025, 1, 1, 12, 0)
    assert is_inactive(state, now)

def test_is_inactive_inside_threshold():
    now = datetime(2025, 1, 2, 12, 0)
    # 12 hours ago
    session_time = now - timedelta(hours=12)
    state = AppState(sessions=(make_session(session_time),))
    assert not is_inactive(state, now)

def test_is_inactive_exactly_at_threshold():
    now = datetime(2025, 1, 2, 12, 0)
    # Exactly INACTIVITY_THRESHOLD ago
    session_time = now - INACTIVITY_THRESHOLD
    state = AppState(sessions=(make_session(session_time),))
    assert not is_inactive(state, now)

def test_is_inactive_outside_threshold():
    now = datetime(2025, 1, 3, 12, 0)
    # INACTIVITY_THRESHOLD + 1 hour ago
    session_time = now - INACTIVITY_THRESHOLD - timedelta(hours=1)
    state = AppState(sessions=(make_session(session_time),))
    assert is_inactive(state, now)
