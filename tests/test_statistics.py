from datetime import date
from uuid import uuid4

from src.types.goal import LearningGoal
from src.logic.statistics import goals_by_status


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
    assert result == {"active": 1, "completed": 0, "abandoned": 0, "unknown_status": 1}
