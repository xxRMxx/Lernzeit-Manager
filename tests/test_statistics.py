from datetime import date, datetime, timedelta
from uuid import uuid4

import pytest

from src.types.goal import LearningGoal
from src.types.session import StudySession
from src.types.milestone import Milestone
from src.logic.statistics import (
    total_hours_all_goals,
    streak_days,
    sessions_by_week,
    milestones_by_status,
    goals_by_status,
    hours_per_goal,
)

def make_goal(
    title="Test Goal",
    target_hours=100.0,
    start=None,
    end=None,
    status="active",
):
    return LearningGoal(
        id=uuid4(),
        title=title,
        description="",
        target_hours=target_hours,
        start_date=start or date(2025, 1, 1),
        end_date=end or date(2025, 12, 31),
        status=status,
    )

def make_session(goal_id=None, seconds=3600, dt=None):
    dt = dt or datetime(2025, 3, 1, 10, 0)
    return StudySession(
        id=uuid4(),
        goal_id=goal_id or uuid4(),
        started_at=dt,
        ended_at=dt + timedelta(seconds=seconds),
        duration_seconds=seconds,
    )

def make_milestone(goal_id=None, status="planned"):
    return Milestone(
        id=uuid4(),
        goal_id=goal_id or uuid4(),
        title="Test Milestone",
        milestone_type="custom",
        target_date=date(2025, 12, 31),
        status=status,
    )

# --- Total Hours Tests ---

def test_total_hours_all_goals():
    gid1 = uuid4()
    gid2 = uuid4()
    sessions = (
        make_session(gid1, 3600),   # 1h
        make_session(gid1, 1800),   # 0.5h
        make_session(gid2, 7200),   # 2h
    )
    assert total_hours_all_goals(sessions) == 3.5

def test_total_hours_all_goals_empty():
    assert total_hours_all_goals(()) == 0.0

# --- Streak Days Tests ---

def test_streak_days():
    gid = uuid4()
    today = date(2025, 3, 10)
    sessions = (
        make_session(gid, 3600, datetime(2025, 3, 10, 10, 0)),
        make_session(gid, 3600, datetime(2025, 3, 9, 10, 0)),
        make_session(gid, 3600, datetime(2025, 3, 8, 10, 0)),
        # Missing March 7
        make_session(gid, 3600, datetime(2025, 3, 6, 10, 0)),
    )
    assert streak_days(sessions, today) == 3

def test_streak_days_no_sessions():
    assert streak_days((), date(2025, 3, 10)) == 0

def test_streak_days_broken_today():
    gid = uuid4()
    today = date(2025, 3, 10)
    sessions = (
        # Studied yesterday but not today
        make_session(gid, 3600, datetime(2025, 3, 9, 10, 0)),
        make_session(gid, 3600, datetime(2025, 3, 8, 10, 0)),
    )
    assert streak_days(sessions, today) == 0

def test_streak_days_multiple_sessions_same_day():
    today = date(2025, 4, 24)
    sessions = (
        make_session(dt=datetime(2025, 4, 24, 10, 0)),
        make_session(dt=datetime(2025, 4, 24, 14, 0)),
        make_session(dt=datetime(2025, 4, 23, 9, 0)),
        make_session(dt=datetime(2025, 4, 23, 18, 0)),
    )
    assert streak_days(sessions, today) == 2

# --- Week Statistics Tests ---

def test_sessions_by_week():
    gid = uuid4()
    sessions = (
        make_session(gid, 3600, datetime(2025, 1, 15, 10, 0)), # Week 3
        make_session(gid, 1800, datetime(2025, 1, 16, 10, 0)), # Week 3
        make_session(gid, 7200, datetime(2025, 3, 5, 10, 0)),  # Week 10
        make_session(gid, 3600, datetime(2024, 1, 15, 10, 0)), # Wrong year
    )
    result = sessions_by_week(sessions, 2025)
    assert result.get(3) == 1.5
    assert result.get(10) == 2.0
    assert len(result) == 2

def test_sessions_by_week_empty():
    assert sessions_by_week((), 2025) == {}

# --- Milestone Statistics Tests ---

def test_milestones_by_status():
    gid = uuid4()
    milestones = (
        make_milestone(gid, "planned"),
        make_milestone(gid, "achieved"),
        make_milestone(gid, "achieved"),
        make_milestone(gid, "missed"),
    )
    result = milestones_by_status(milestones)
    assert result == {"planned": 1, "achieved": 2, "missed": 1}

def test_milestones_by_status_empty():
    result = milestones_by_status(())
    assert result == {"planned": 0, "achieved": 0, "missed": 0}

# --- Goal Statistics Tests ---

def test_goals_by_status():
    goals = (
        make_goal(status="active"),
        make_goal(status="completed"),
        make_goal(status="completed"),
        make_goal(status="abandoned"),
    )
    result = goals_by_status(goals)
    assert result == {"active": 1, "completed": 2, "abandoned": 1}

def test_goals_by_status_empty():
    result = goals_by_status(())
    assert result == {"active": 0, "completed": 0, "abandoned": 0}

def test_goals_by_status_unexpected():
    goals = (
        make_goal(status="active"),
        make_goal(status="unknown_status"),
    )
    result = goals_by_status(goals)
    assert result["active"] == 1
    assert result["unknown_status"] == 1

# --- Hours Per Goal Tests ---

def test_hours_per_goal():
    gid1 = uuid4()
    gid2 = uuid4()
    gid3 = uuid4()

    goals = (
        LearningGoal(id=gid1, title="Math", description="", target_hours=100.0, start_date=date(2025,1,1), end_date=date(2025,6,30), status="active"),
        LearningGoal(id=gid2, title="Science", description="", target_hours=100.0, start_date=date(2025,1,1), end_date=date(2025,6,30), status="active")
    )

    sessions = (
        make_session(gid1, 3600),   # Math 1h
        make_session(gid2, 7200),   # Science 2h
        make_session(gid1, 1800),   # Math 0.5h
        make_session(gid3, 3600),   # Unknown goal 1h
    )

    result = hours_per_goal(goals, sessions)

    # Expected order: Science (2h), Math (1.5h), Unbekannt (1h)
    assert len(result) == 3

    assert result[0]["goal_id"] == str(gid2)
    assert result[0]["title"] == "Science"
    assert result[0]["hours"] == 2.0

    assert result[1]["goal_id"] == str(gid1)
    assert result[1]["title"] == "Math"
    assert result[1]["hours"] == 1.5

    assert result[2]["goal_id"] == str(gid3)
    assert result[2]["title"] == "Unbekannt"
    assert result[2]["hours"] == 1.0

def test_hours_per_goal_empty():
    assert hours_per_goal((), ()) == []
