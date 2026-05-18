from datetime import date, datetime
from uuid import uuid4

from src.types.goal import LearningGoal
from src.types.session import StudySession
from src.types.plan import RoughPlanEntry
from src.logic.planning import (
    total_planned_hours, total_studied_hours, completion_ratio,
    monthly_breakdown, planned_vs_actual, days_remaining, hours_per_day_needed,
)


def make_goal(target_hours=100.0, start=None, end=None):
    return LearningGoal(
        id=uuid4(),
        title="Test",
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


def test_total_planned_hours():
    gid = uuid4()
    plans = (
        RoughPlanEntry(goal_id=gid, year=2025, month=1, planned_hours=10),
        RoughPlanEntry(goal_id=gid, year=2025, month=2, planned_hours=15),
        RoughPlanEntry(goal_id=uuid4(), year=2025, month=1, planned_hours=5),
    )
    assert total_planned_hours(gid, plans) == 25.0


def test_total_studied_hours():
    gid = uuid4()
    sessions = (
        make_session(gid, 3600),   # 1h
        make_session(gid, 1800),   # 0.5h
        make_session(uuid4(), 7200),  # anderes Ziel
    )
    assert total_studied_hours(gid, sessions) == 1.5


def test_completion_ratio():
    goal = make_goal(target_hours=10.0)
    sessions = (make_session(goal.id, 18000),)  # 5h
    ratio = completion_ratio(goal, sessions)
    assert abs(ratio - 0.5) < 0.001


def test_completion_ratio_zero_target():
    goal = make_goal(target_hours=0.0)
    assert completion_ratio(goal, ()) == 0.0


def test_completion_ratio_capped_at_one():
    goal = make_goal(target_hours=1.0)
    sessions = (make_session(goal.id, 7200),)  # 2h > Ziel
    assert completion_ratio(goal, sessions) == 1.0


def test_monthly_breakdown():
    gid = uuid4()
    sessions = (
        make_session(gid, 3600, datetime(2025, 1, 15)),
        make_session(gid, 3600, datetime(2025, 1, 20)),
        make_session(gid, 7200, datetime(2025, 3, 5)),
    )
    breakdown = monthly_breakdown(gid, sessions, 2025)
    assert abs(breakdown[1] - 2.0) < 0.001
    assert abs(breakdown[3] - 2.0) < 0.001
    assert breakdown[2] == 0.0


def test_days_remaining():
    goal = make_goal(end=date(2025, 12, 31))
    remaining = days_remaining(goal, date(2025, 12, 1))
    assert remaining == 30


def test_days_remaining_past():
    goal = make_goal(end=date(2025, 1, 1))
    assert days_remaining(goal, date(2025, 6, 1)) == 0


def test_hours_per_day_needed():
    goal = make_goal(target_hours=100.0, end=date(2025, 1, 31))
    sessions = (make_session(goal.id, 3600 * 40),) # 40h gelernt, 60h offen
    # 60h / 30 Tage = 2h/Tag
    assert hours_per_day_needed(goal, sessions, date(2025, 1, 1)) == 2.0


def test_hours_per_day_needed_zero_days():
    goal = make_goal(target_hours=100.0, end=date(2025, 1, 1))
    assert hours_per_day_needed(goal, (), date(2025, 1, 1)) == 0.0


def test_planned_vs_actual():
    gid = uuid4()
    other_gid = uuid4()

    # 2025
    plans = (
        RoughPlanEntry(goal_id=gid, year=2025, month=1, planned_hours=10),
        RoughPlanEntry(goal_id=gid, year=2025, month=2, planned_hours=15),
        RoughPlanEntry(goal_id=gid, year=2024, month=1, planned_hours=20),  # wrong year
        RoughPlanEntry(goal_id=other_gid, year=2025, month=1, planned_hours=5), # wrong goal
    )

    sessions = (
        make_session(gid, 3600, datetime(2025, 1, 15)), # 1h in Jan 2025
        make_session(gid, 7200, datetime(2025, 1, 20)), # 2h in Jan 2025
        make_session(gid, 1800, datetime(2025, 3, 5)),  # 0.5h in Mar 2025
        make_session(gid, 3600, datetime(2024, 1, 10)), # wrong year
        make_session(other_gid, 3600, datetime(2025, 1, 1)), # wrong goal
    )

    result = planned_vs_actual(gid, plans, sessions, 2025)

    assert len(result) == 12

    # Month 1
    assert result[0]["month"] == 1
    assert result[0]["planned_hours"] == 10.0
    assert result[0]["actual_hours"] == 3.0

    # Month 2
    assert result[1]["month"] == 2
    assert result[1]["planned_hours"] == 15.0
    assert result[1]["actual_hours"] == 0.0

    # Month 3
    assert result[2]["month"] == 3
    assert result[2]["planned_hours"] == 0.0
    assert result[2]["actual_hours"] == 0.5

    # Other months
    for m in range(4, 13):
        assert result[m-1]["month"] == m
        assert result[m-1]["planned_hours"] == 0.0
        assert result[m-1]["actual_hours"] == 0.0
