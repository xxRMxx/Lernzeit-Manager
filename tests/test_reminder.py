from datetime import date, datetime, timedelta
from uuid import uuid4

from src.types.app_state import AppState
from src.types.goal import LearningGoal
from src.types.session import StudySession
from src.types.plan import MonthPlan, TimeSlot
from src.logic.reminder import get_reminders


def make_goal():
    return LearningGoal(
        id=uuid4(),
        title="Test Goal",
        description="",
        target_hours=10.0,
        start_date=date(2025, 1, 1),
        end_date=date(2025, 12, 31),
    )


def make_session(goal_id, dt):
    return StudySession(
        id=uuid4(),
        goal_id=goal_id,
        started_at=dt,
        ended_at=dt,
        duration_seconds=3600,
    )


def make_month_plan(goal_id, year, month, slots):
    return MonthPlan(
        goal_id=goal_id,
        year=year,
        month=month,
        slots=tuple(slots),
    )


def make_time_slot(dt):
    return TimeSlot(
        date=dt,
        planned_minutes=60,
    )


def test_get_reminders_no_goals():
    state = AppState(goals=())
    now = datetime(2025, 3, 15, 10, 0)
    assert get_reminders(state, now) == []


def test_get_reminders_no_sessions_has_goals():
    goal = make_goal()
    state = AppState(goals=(goal,), sessions=())
    now = datetime(2025, 3, 15, 10, 0)
    reminders = get_reminders(state, now)
    assert reminders == ["Du hast noch keine Lernzeit erfasst. Starte jetzt!"]


def test_get_reminders_inactive_with_sessions():
    goal = make_goal()
    now = datetime(2025, 3, 15, 10, 0)
    # Session war vor 30 Stunden
    last_session_time = now - timedelta(hours=30)
    session = make_session(goal.id, last_session_time)

    state = AppState(goals=(goal,), sessions=(session,))
    reminders = get_reminders(state, now)

    assert reminders == [
        "Du hast seit 30 Stunden nicht gelernt. Zeit für eine Lerneinheit?"
    ]


def test_get_reminders_active_with_sessions():
    goal = make_goal()
    now = datetime(2025, 3, 15, 10, 0)
    # Session war vor 10 Stunden (weniger als 24h Threshold)
    last_session_time = now - timedelta(hours=10)
    session = make_session(goal.id, last_session_time)

    state = AppState(goals=(goal,), sessions=(session,))
    reminders = get_reminders(state, now)

    assert reminders == []


def test_get_reminders_overdue_slots():
    goal = make_goal()
    now = datetime(2025, 3, 15, 10, 0)

    # 2 overdue slots
    slot1 = make_time_slot(date(2025, 3, 10))
    slot2 = make_time_slot(date(2025, 3, 12))
    # 1 future slot (not overdue)
    slot3 = make_time_slot(date(2025, 3, 20))

    month_plan = make_month_plan(goal.id, 2025, 3, [slot1, slot2, slot3])

    # Session on a different date so slots are not fulfilled
    session = make_session(goal.id, now - timedelta(hours=10))

    state = AppState(
        goals=(goal,),
        sessions=(session,),
        month_plans=(month_plan,)
    )

    reminders = get_reminders(state, now)
    assert reminders == ["2 geplante Lerneinheit(en) wurden nicht erledigt."]


def test_get_reminders_combined():
    goal = make_goal()
    now = datetime(2025, 3, 15, 10, 0)

    # Session war vor 30 Stunden (Inactive)
    last_session_time = now - timedelta(hours=30)
    session = make_session(goal.id, last_session_time)

    # 1 overdue slot
    slot1 = make_time_slot(date(2025, 3, 10))
    month_plan = make_month_plan(goal.id, 2025, 3, [slot1])

    state = AppState(
        goals=(goal,),
        sessions=(session,),
        month_plans=(month_plan,)
    )

    reminders = get_reminders(state, now)
    assert len(reminders) == 2
    assert reminders[0] == "Du hast seit 30 Stunden nicht gelernt. Zeit für eine Lerneinheit?"
    assert reminders[1] == "1 geplante Lerneinheit(en) wurden nicht erledigt."
