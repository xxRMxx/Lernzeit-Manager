from datetime import datetime, timedelta
from uuid import uuid4

from src.types.app_state import AppState
from src.types.session import StudySession
from src.logic.reminder import last_activity


def make_session(goal_id, seconds, dt_end):
    return StudySession(
        id=uuid4(),
        goal_id=goal_id,
        started_at=dt_end - timedelta(seconds=seconds),
        ended_at=dt_end,
        duration_seconds=seconds,
    )


def test_last_activity_empty():
    state = AppState(sessions=())
    assert last_activity(state) is None


def test_last_activity_single_session():
    dt = datetime(2025, 3, 1, 12, 0)
    session = make_session(uuid4(), 3600, dt)
    state = AppState(sessions=(session,))
    assert last_activity(state) == dt


def test_last_activity_multiple_sessions():
    dt1 = datetime(2025, 3, 1, 10, 0)
    dt2 = datetime(2025, 3, 1, 15, 0)
    dt3 = datetime(2025, 3, 1, 12, 0)

    goal_id = uuid4()
    sessions = (
        make_session(goal_id, 3600, dt1),
        make_session(goal_id, 3600, dt2),
        make_session(goal_id, 3600, dt3),
    )
    state = AppState(sessions=sessions)
    assert last_activity(state) == dt2
