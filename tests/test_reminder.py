from datetime import datetime, date
from uuid import uuid4

from src.types.app_state import AppState
from src.types.session import StudySession
from src.types.plan import MonthPlan, TimeSlot
from src.logic.reminder import last_activity, get_reminders

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
    from src.types.goal import LearningGoal
    goal = LearningGoal(id=gid, title="Test", description="", target_hours=10, start_date=date(2025,1,1), end_date=date(2025,1,1))
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
