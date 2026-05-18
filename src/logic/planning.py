from datetime import date
from uuid import UUID

from src.types.goal import LearningGoal
from src.types.plan import RoughPlanEntry, MonthPlan, TimeSlot
from src.types.session import StudySession


def total_planned_hours(
    rough_plans: tuple[RoughPlanEntry, ...]
) -> dict[UUID, float]:
    """
    Pure: berechnet geplante Stunden aus der Grobplanung für alle Ziele.
    Gibt {goal_id: total_hours} zurück.
    """
    result: dict[UUID, float] = {}
    for p in rough_plans:
        result[p.goal_id] = result.get(p.goal_id, 0.0) + p.planned_hours
    return result


def total_studied_hours(
    goal_id: UUID, sessions: tuple[StudySession, ...]
) -> float:
    """Pure: summiert tatsächlich gelernte Stunden für ein Ziel."""
    return sum(
        s.duration_seconds for s in sessions if s.goal_id == goal_id
    ) / 3600


def completion_ratio(
    goal: LearningGoal, sessions: tuple[StudySession, ...]
) -> float:
    """Pure: Fortschritt 0.0-1.0. Verhindert Division durch Null."""
    if goal.target_hours <= 0:
        return 0.0
    return min(total_studied_hours(goal.id, sessions) / goal.target_hours, 1.0)


def monthly_breakdown(
    goal_id: UUID,
    sessions: tuple[StudySession, ...],
    year: int,
) -> dict[int, float]:
    """Pure: tatsächlich gelernte Stunden pro Monat (1-12) für ein Ziel."""
    result: dict[int, float] = {m: 0.0 for m in range(1, 13)}
    for s in sessions:
        if s.goal_id == goal_id and s.started_at.year == year:
            result[s.started_at.month] += s.duration_seconds / 3600
    return result


def planned_vs_actual(
    goal_id: UUID,
    rough_plans: tuple[RoughPlanEntry, ...],
    sessions: tuple[StudySession, ...],
    year: int,
) -> list[dict]:
    """
    Pure: Soll-Ist-Vergleich pro Monat für ein Ziel.
    Gibt Liste von {month, planned_hours, actual_hours} zurück.
    """
    actual = monthly_breakdown(goal_id, sessions, year)
    planned: dict[int, float] = {m: 0.0 for m in range(1, 13)}
    for p in rough_plans:
        if p.goal_id == goal_id and p.year == year:
            planned[p.month] = p.planned_hours

    return [
        {"month": m, "planned_hours": planned[m], "actual_hours": actual[m]}
        for m in range(1, 13)
    ]


def overdue_slots(
    month_plans: tuple[MonthPlan, ...],
    sessions: tuple[StudySession, ...],
    today: date,
) -> list[TimeSlot]:
    """Pure: Slots, die vergangen sind ohne zugehörige Lernsession."""
    studied_dates = {s.started_at.date() for s in sessions}
    result = []
    for plan in month_plans:
        for slot in plan.slots:
            if slot.date < today and slot.date not in studied_dates:
                result.append(slot)
    return result


def days_remaining(goal: LearningGoal, today: date) -> int:
    """Pure: verbleibende Tage bis zum Ziel-Enddatum."""
    delta = goal.end_date - today
    return max(delta.days, 0)


def hours_per_day_needed(
    goal: LearningGoal,
    sessions: tuple[StudySession, ...],
    today: date,
) -> float:
    """Pure: nötige Stunden/Tag um das Ziel noch zu erreichen."""
    remaining_hours = goal.target_hours - total_studied_hours(goal.id, sessions)
    remaining_days = days_remaining(goal, today)
    if remaining_days <= 0 or remaining_hours <= 0:
        return 0.0
    return remaining_hours / remaining_days
