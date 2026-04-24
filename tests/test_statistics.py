from datetime import datetime
from uuid import uuid4

from src.types.session import StudySession
from src.logic.statistics import sessions_by_week


def make_session(seconds: float, dt: datetime) -> StudySession:
    return StudySession(
        id=uuid4(),
        goal_id=uuid4(),
        started_at=dt,
        ended_at=dt,
        duration_seconds=seconds,
    )


def test_sessions_by_week_empty():
    assert sessions_by_week(tuple(), 2025) == {}


def test_sessions_by_week_multiple_weeks():
    sessions = (
        make_session(3600, datetime(2025, 1, 1, 10, 0)), # Week 1
        make_session(7200, datetime(2025, 1, 8, 10, 0)), # Week 2
        make_session(1800, datetime(2025, 1, 15, 10, 0)), # Week 3
    )
    result = sessions_by_week(sessions, 2025)
    assert result == {1: 1.0, 2: 2.0, 3: 0.5}


def test_sessions_by_week_different_years():
    sessions = (
        make_session(3600, datetime(2024, 1, 1, 10, 0)), # Week 1 of 2024
        make_session(7200, datetime(2025, 1, 8, 10, 0)), # Week 2 of 2025
    )
    # Only 2025 sessions should be considered
    result = sessions_by_week(sessions, 2025)
    assert result == {2: 2.0}


def test_sessions_by_week_multiple_sessions_same_week():
    sessions = (
        make_session(3600, datetime(2025, 1, 1, 10, 0)), # Week 1
        make_session(1800, datetime(2025, 1, 2, 10, 0)), # Week 1
        make_session(7200, datetime(2025, 1, 8, 10, 0)), # Week 2
    )
    result = sessions_by_week(sessions, 2025)
    assert result == {1: 1.5, 2: 2.0}
