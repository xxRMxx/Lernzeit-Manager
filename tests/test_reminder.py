from datetime import datetime, timedelta
from uuid import uuid4

from src.types.app_state import AppState
from src.types.goal import LearningGoal
from src.types.session import StudySession
from src.logic.reminder import is_inactive, INACTIVITY_THRESHOLD

def make_session(ended_at: datetime) -> StudySession:
    return StudySession(
        id=uuid4(),
        goal_id=uuid4(),
        started_at=ended_at - timedelta(hours=1),
        ended_at=ended_at,
        duration_seconds=3600
    )

def make_goal() -> LearningGoal:
    return LearningGoal(
        id=uuid4(),
        title="Test Goal",
        description="",
        target_hours=10.0,
        start_date=datetime.now().date(),
        end_date=(datetime.now() + timedelta(days=30)).date()
    )

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

def test_is_inactive_multiple_sessions_newest_inside():
    now = datetime(2025, 1, 3, 12, 0)
    older_session_time = now - timedelta(days=3)
    newer_session_time = now - timedelta(hours=5)
    state = AppState(sessions=(
        make_session(older_session_time),
        make_session(newer_session_time),
    ))
    assert not is_inactive(state, now)

def test_is_inactive_multiple_sessions_newest_outside():
    now = datetime(2025, 1, 5, 12, 0)
    older_session_time = now - timedelta(days=5)
    newer_session_time = now - timedelta(days=2)
    state = AppState(sessions=(
        make_session(older_session_time),
        make_session(newer_session_time),
    ))
    assert is_inactive(state, now)
