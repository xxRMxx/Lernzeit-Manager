from datetime import date, datetime, timedelta
from uuid import uuid4

from src.types.session import StudySession
from src.types.goal import LearningGoal
from src.types.milestone import Milestone
from src.logic.statistics import (
    total_hours_all_goals,
    streak_days,
    sessions_by_week,
    milestones_by_status,
    goals_by_status,
    hours_per_goal,
)

def make_goal(status="active"):
    return LearningGoal(
        id=uuid4(),
        title="Test Goal",
        description="",
        target_hours=10.0,
        start_date=date(2025, 1, 1),
        end_date=date(2025, 12, 31),
        status=status,
    )

def test_total_hours_all_goals():
    now = datetime.now()
    s1 = StudySession(id=uuid4(), goal_id=uuid4(), started_at=now, ended_at=now, duration_seconds=3600)
    s2 = StudySession(id=uuid4(), goal_id=uuid4(), started_at=now, ended_at=now, duration_seconds=1800)
    assert total_hours_all_goals((s1, s2)) == 1.5
    assert total_hours_all_goals(()) == 0

def test_streak_days():
    today = date(2025, 1, 10)
    gid = uuid4()
    
    # 3 days streak
    sessions = (
        StudySession(id=uuid4(), goal_id=gid, started_at=datetime(2025, 1, 10, 10, 0), ended_at=datetime(2025, 1, 10, 11, 0), duration_seconds=3600),
        StudySession(id=uuid4(), goal_id=gid, started_at=datetime(2025, 1, 9, 10, 0), ended_at=datetime(2025, 1, 9, 11, 0), duration_seconds=3600),
        StudySession(id=uuid4(), goal_id=gid, started_at=datetime(2025, 1, 8, 10, 0), ended_at=datetime(2025, 1, 8, 11, 0), duration_seconds=3600),
    )
    assert streak_days(sessions, today) == 3
    
    # Broken streak (missing yesterday)
    sessions = (
        StudySession(id=uuid4(), goal_id=gid, started_at=datetime(2025, 1, 10, 10, 0), ended_at=datetime(2025, 1, 10, 11, 0), duration_seconds=3600),
        StudySession(id=uuid4(), goal_id=gid, started_at=datetime(2025, 1, 8, 10, 0), ended_at=datetime(2025, 1, 8, 11, 0), duration_seconds=3600),
    )
    assert streak_days(sessions, today) == 1
    
    # No sessions today
    sessions = (
        StudySession(id=uuid4(), goal_id=gid, started_at=datetime(2025, 1, 9, 10, 0), ended_at=datetime(2025, 1, 9, 11, 0), duration_seconds=3600),
    )
    assert streak_days(sessions, today) == 0

def test_sessions_by_week():
    gid = uuid4()
    # 2025-01-01 is Wednesday, KW1
    # 2025-01-08 is Wednesday, KW2
    sessions = (
        StudySession(id=uuid4(), goal_id=gid, started_at=datetime(2025, 1, 1, 10, 0), ended_at=datetime(2025, 1, 1, 11, 0), duration_seconds=3600),
        StudySession(id=uuid4(), goal_id=gid, started_at=datetime(2025, 1, 2, 10, 0), ended_at=datetime(2025, 1, 2, 12, 0), duration_seconds=7200),
        StudySession(id=uuid4(), goal_id=gid, started_at=datetime(2025, 1, 8, 10, 0), ended_at=datetime(2025, 1, 8, 11, 0), duration_seconds=3600),
    )
    result = sessions_by_week(sessions, 2025)
    assert result[1] == 3.0
    assert result[2] == 1.0
    assert len(result) == 2

def test_milestones_by_status():
    gid = uuid4()
    m1 = Milestone(id=uuid4(), goal_id=gid, title="M1", milestone_type="custom", status="achieved", target_date=date.today())
    m2 = Milestone(id=uuid4(), goal_id=gid, title="M2", milestone_type="custom", status="planned", target_date=date.today())
    m3 = Milestone(id=uuid4(), goal_id=gid, title="M3", milestone_type="custom", status="planned", target_date=date.today())
    
    result = milestones_by_status((m1, m2, m3))
    assert result["achieved"] == 1
    assert result["planned"] == 2
    assert result["missed"] == 0

def test_goals_by_status_empty():
    result = goals_by_status(())
    assert result == {"active": 0, "completed": 0, "abandoned": 0}

def test_goals_by_status_counts():
    goals = (
        make_goal(status="active"),
        make_goal(status="active"),
        make_goal(status="completed"),
        make_goal(status="abandoned"),
        make_goal(status="completed"),
        make_goal(status="completed"),
    )
    result = goals_by_status(goals)
    assert result == {"active": 2, "completed": 3, "abandoned": 1}

def test_goals_by_status_unexpected():
    goals = (
        make_goal(status="active"),
        make_goal(status="unknown_status"),
    )
    result = goals_by_status(goals)
    # The actual implementation might include unexpected statuses in the result
    assert result["active"] == 1
    assert result["unknown_status"] == 1

def test_hours_per_goal():
    gid1 = uuid4()
    gid2 = uuid4()
    g1 = LearningGoal(id=gid1, title="Mathe", description="", target_hours=10, start_date=date.today(), end_date=date.today())
    
    now = datetime.now()
    sessions = (
        StudySession(id=uuid4(), goal_id=gid1, started_at=now, ended_at=now, duration_seconds=3600),
        StudySession(id=uuid4(), goal_id=gid2, started_at=now, ended_at=now, duration_seconds=7200),
    )
    
    result = hours_per_goal((g1,), sessions)
    # Sorting should be descending by hours: gid2 (2h) then gid1 (1h)
    assert result[0]["hours"] == 2.0
    assert result[0]["title"] == "Unbekannt"
    assert result[1]["hours"] == 1.0
    assert result[1]["title"] == "Mathe"
