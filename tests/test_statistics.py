from datetime import date, datetime
from uuid import uuid4

from src.types.goal import LearningGoal
from src.types.session import StudySession
from src.logic.statistics import hours_per_goal


def make_goal(id=None, title="Test", target_hours=100.0, start=None, end=None):
    return LearningGoal(
        id=id or uuid4(),
        title=title,
        description="",
        target_hours=target_hours,
        start_date=start or date(2025, 1, 1),
        end_date=end or date(2025, 6, 30),
    )


def make_session(goal_id, seconds, dt=None):
    dt = dt or datetime(2025, 3, 1, 10, 0)
    return StudySession(
        id=uuid4(),
        goal_id=goal_id,
        started_at=dt,
        ended_at=dt,
        duration_seconds=seconds,
    )


def test_hours_per_goal_basic():
    goal1 = make_goal(title="Goal 1")
    goal2 = make_goal(title="Goal 2")

    sessions = (
        make_session(goal1.id, 3600), # 1h
        make_session(goal1.id, 7200), # 2h
        make_session(goal2.id, 1800), # 0.5h
    )

    result = hours_per_goal((goal1, goal2), sessions)

    # Should be sorted descending by hours: Goal 1 (3h) > Goal 2 (0.5h)
    assert len(result) == 2

    assert result[0]["goal_id"] == str(goal1.id)
    assert result[0]["title"] == "Goal 1"
    assert result[0]["hours"] == 3.0

    assert result[1]["goal_id"] == str(goal2.id)
    assert result[1]["title"] == "Goal 2"
    assert result[1]["hours"] == 0.5


def test_hours_per_goal_unknown_goal():
    goal1 = make_goal(title="Goal 1")
    unknown_goal_id = uuid4()

    sessions = (
        make_session(goal1.id, 3600), # 1h
        make_session(unknown_goal_id, 7200), # 2h
    )

    result = hours_per_goal((goal1,), sessions)

    assert len(result) == 2

    # The unknown goal has 2 hours, so it should be first
    assert result[0]["goal_id"] == str(unknown_goal_id)
    assert result[0]["title"] == "Unbekannt"
    assert result[0]["hours"] == 2.0

    assert result[1]["goal_id"] == str(goal1.id)
    assert result[1]["title"] == "Goal 1"
    assert result[1]["hours"] == 1.0


def test_hours_per_goal_empty():
    goal1 = make_goal(title="Goal 1")

    result = hours_per_goal((goal1,), ())
    assert result == []


def test_hours_per_goal_sorting():
    goal1 = make_goal(title="Goal 1")
    goal2 = make_goal(title="Goal 2")
    goal3 = make_goal(title="Goal 3")

    sessions = (
        make_session(goal1.id, 3600), # 1h
        make_session(goal3.id, 10800), # 3h
        make_session(goal2.id, 7200), # 2h
    )

    result = hours_per_goal((goal1, goal2, goal3), sessions)

    assert len(result) == 3
    assert result[0]["title"] == "Goal 3"
    assert result[1]["title"] == "Goal 2"
    assert result[2]["title"] == "Goal 1"
