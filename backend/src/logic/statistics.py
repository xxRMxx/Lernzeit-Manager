from datetime import date, timedelta
from functools import reduce
from uuid import UUID

from src.types.session import StudySession
from src.types.goal import LearningGoal
from src.types.milestone import Milestone


def weekly_comparison(
    sessions: tuple,
    timeslots: tuple,
    start_date: date
) -> list[dict]:
    """
    Pure: Vergleich von geplanten (TimeSlots) und tatsächlichen (Sessions) Stunden
    für eine Woche ab dem start_date.
    Gibt eine Liste von dicts zurück: [{"day": "Mo", "soll": 2.0, "ist": 1.5}, ...]
    """
    days_labels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
    result = []
    
    for i in range(7):
        current_date = start_date + timedelta(days=i)
        
        # Soll (planned) from timeslots (planned_minutes)
        soll_minutes = sum(ts.planned_minutes for ts in timeslots if ts.date == current_date)
        soll_hours = round(soll_minutes / 60, 2)
        
        # Ist (actual) from sessions (duration_seconds)
        # Note: started_at can be datetime or date depending on source
        ist_seconds = 0
        for s in sessions:
            s_date = s.started_at.date() if hasattr(s.started_at, 'date') else s.started_at
            if s_date == current_date:
                ist_seconds += s.duration_seconds
        
        ist_hours = round(ist_seconds / 3600, 2)
        
        result.append({
            "day": days_labels[i],
            "soll": soll_hours,
            "ist": ist_hours
        })
        
    return result


def total_hours_all_goals(sessions: tuple[StudySession, ...]) -> float:
    """Pure: gesamte Lernzeit über alle Ziele in Stunden."""
    return reduce(lambda acc, s: acc + s.duration_seconds, sessions, 0) / 3600


def streak_days(sessions: tuple[StudySession, ...], today: date) -> int:
    """
    Pure: Anzahl aufeinanderfolgender Lerntage bis heute.
    Ein Tag zählt wenn mindestens eine Session vorhanden.
    Der Streak reißt nicht ab, wenn heute noch nicht gelernt wurde,
    aber gestern gelernt wurde.
    """
    if not sessions:
        return 0

    studied_dates = {s.started_at.date() for s in sessions}
    
    # If not studied today, but studied yesterday, start counting from yesterday
    current = today
    if current not in studied_dates and (current - timedelta(days=1)) in studied_dates:
        current -= timedelta(days=1)
        
    streak = 0
    while current in studied_dates:
        streak += 1
        current -= timedelta(days=1)
    return streak


def sessions_by_week(
    sessions: tuple[StudySession, ...],
    year: int,
) -> dict[int, float]:
    """
    Pure: Lernstunden pro Kalenderwoche des Jahres.
    Gibt {week_number: hours} zurück.
    """
    result: dict[int, float] = {}
    for s in sessions:
        if s.started_at.year == year:
            week = s.started_at.isocalendar()[1]
            result[week] = result.get(week, 0.0) + s.duration_seconds / 3600
    return result


def milestones_by_status(
    milestones: tuple[Milestone, ...],
) -> dict[str, int]:
    """Pure: Anzahl Meilensteine je Status."""
    result: dict[str, int] = {"planned": 0, "achieved": 0, "missed": 0}
    for m in milestones:
        result[m.status] = result.get(m.status, 0) + 1
    return result


def goals_by_status(goals: tuple[LearningGoal, ...]) -> dict[str, int]:
    """Pure: Anzahl Ziele je Status."""
    result: dict[str, int] = {"active": 0, "completed": 0, "abandoned": 0}
    for g in goals:
        result[g.status] = result.get(g.status, 0) + 1
    return result


def hours_per_goal(
    goals: tuple[LearningGoal, ...],
    sessions: tuple[StudySession, ...],
) -> list[dict]:
    """Pure: gelernte Stunden und Ziel-Titel je Ziel."""
    goal_map = {g.id: g for g in goals}
    hours: dict[UUID, float] = {}
    for s in sessions:
        hours[s.goal_id] = hours.get(s.goal_id, 0.0) + s.duration_seconds / 3600

    return [
        {
            "goal_id": str(gid),
            "title": goal_map[gid].title if gid in goal_map else "Unbekannt",
            "hours": h,
        }
        for gid, h in sorted(hours.items(), key=lambda x: x[1], reverse=True)
    ]
