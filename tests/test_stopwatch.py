from datetime import datetime
from uuid import uuid4

import pytest

from src.types.session import StopwatchState
from src.logic.stopwatch import (
    elapsed_seconds, start_stopwatch, pause_stopwatch,
    resume_stopwatch, stop_stopwatch, format_seconds,
)


@pytest.fixture
def goal_id():
    return uuid4()


def test_idle_elapsed_is_zero():
    sw = StopwatchState()
    assert elapsed_seconds(sw, datetime.now()) == 0


def test_start_sets_running(goal_id):
    sw = StopwatchState()
    now = datetime.now()
    result = start_stopwatch(sw, goal_id, now)
    assert result.phase == "running"
    assert result.started_at == now
    assert result.goal_id == goal_id


def test_elapsed_during_run(goal_id):
    t0 = datetime(2025, 1, 1, 10, 0, 0)
    t1 = datetime(2025, 1, 1, 10, 0, 30)
    sw = StopwatchState(phase="running", started_at=t0, goal_id=goal_id)
    assert elapsed_seconds(sw, t1) == 30


def test_pause_accumulates_time(goal_id):
    t0 = datetime(2025, 1, 1, 10, 0, 0)
    t1 = datetime(2025, 1, 1, 10, 1, 0)  # 60 Sekunden später
    sw = StopwatchState(phase="running", started_at=t0, goal_id=goal_id)
    paused = pause_stopwatch(sw, t1)
    assert paused.phase == "paused"
    assert paused.accumulated_seconds == 60


def test_resume_after_pause(goal_id):
    sw = StopwatchState(phase="paused", accumulated_seconds=60, goal_id=goal_id)
    t = datetime.now()
    resumed = resume_stopwatch(sw, t)
    assert resumed.phase == "running"
    assert resumed.accumulated_seconds == 60
    assert resumed.started_at == t


def test_stop_creates_session(goal_id):
    t0 = datetime(2025, 1, 1, 10, 0, 0)
    t1 = datetime(2025, 1, 1, 10, 2, 30)  # 150 Sekunden
    sw = StopwatchState(phase="running", started_at=t0, goal_id=goal_id)
    new_sw, session = stop_stopwatch(sw, t1, note="Test")
    assert new_sw.phase == "idle"
    assert session is not None
    assert session.duration_seconds == 150
    assert session.note == "Test"
    assert session.goal_id == goal_id


def test_stop_idle_returns_no_session():
    sw = StopwatchState()
    _, session = stop_stopwatch(sw, datetime.now())
    assert session is None


def test_format_seconds():
    assert format_seconds(0) == "00:00:00"
    assert format_seconds(90) == "00:01:30"
    assert format_seconds(3661) == "01:01:01"
