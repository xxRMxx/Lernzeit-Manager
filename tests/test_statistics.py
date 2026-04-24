from datetime import date
from uuid import uuid4

from src.types.milestone import Milestone
from src.logic.statistics import milestones_by_status


def make_milestone(status="planned"):
    return Milestone(
        id=uuid4(),
        goal_id=uuid4(),
        title="Test Milestone",
        milestone_type="custom",
        target_date=date(2025, 1, 1),
        status=status,
    )


def test_milestones_by_status_empty():
    milestones = ()
    result = milestones_by_status(milestones)
    assert result == {"planned": 0, "achieved": 0, "missed": 0}


def test_milestones_by_status_single():
    milestones = (
        make_milestone("planned"),
        make_milestone("planned"),
    )
    result = milestones_by_status(milestones)
    assert result == {"planned": 2, "achieved": 0, "missed": 0}


def test_milestones_by_status_mixed():
    milestones = (
        make_milestone("planned"),
        make_milestone("achieved"),
        make_milestone("achieved"),
        make_milestone("missed"),
    )
    result = milestones_by_status(milestones)
    assert result == {"planned": 1, "achieved": 2, "missed": 1}
