from datetime import date, datetime, timedelta
from uuid import uuid4

import pytest

from src.types.session import StudySession
from src.logic.statistics import streak_days


def make_session(dt: datetime, duration: int = 3600) -> StudySession:
    return StudySession(
        id=uuid4(),
        goal_id=uuid4(),
        started_at=dt,
        ended_at=dt + timedelta(seconds=duration),
        duration_seconds=duration,
    )


def test_streak_days_no_sessions():
    today = date(2025, 4, 24)
    assert streak_days((), today) == 0


def test_streak_days_single_session_today():
    today = date(2025, 4, 24)
    sessions = (
        make_session(datetime(2025, 4, 24, 10, 0)),
    )
    assert streak_days(sessions, today) == 1


def test_streak_days_consecutive_sessions():
    today = date(2025, 4, 24)
    sessions = (
        make_session(datetime(2025, 4, 24, 10, 0)),
        make_session(datetime(2025, 4, 23, 10, 0)),
        make_session(datetime(2025, 4, 22, 10, 0)),
    )
    assert streak_days(sessions, today) == 3


def test_streak_days_broken_streak():
    today = date(2025, 4, 24)
    sessions = (
        make_session(datetime(2025, 4, 24, 10, 0)),
        make_session(datetime(2025, 4, 23, 10, 0)),
        # Missed 22nd
        make_session(datetime(2025, 4, 21, 10, 0)),
        make_session(datetime(2025, 4, 20, 10, 0)),
    )
    assert streak_days(sessions, today) == 2


def test_streak_days_missing_today():
    today = date(2025, 4, 24)
    sessions = (
        make_session(datetime(2025, 4, 23, 10, 0)),
        make_session(datetime(2025, 4, 22, 10, 0)),
    )
    # Since today has no session, current streak is 0
    assert streak_days(sessions, today) == 0


def test_streak_days_multiple_sessions_same_day():
    today = date(2025, 4, 24)
    sessions = (
        make_session(datetime(2025, 4, 24, 10, 0)),
        make_session(datetime(2025, 4, 24, 14, 0)),
        make_session(datetime(2025, 4, 23, 9, 0)),
        make_session(datetime(2025, 4, 23, 18, 0)),
    )
    assert streak_days(sessions, today) == 2
