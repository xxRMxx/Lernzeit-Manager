"""
Pure Funktionen für Serialisierung/Deserialisierung des AppState.
Kein IO hier – nur dict <-> AppState Konvertierung.
"""
import json
from dataclasses import asdict
from datetime import date, datetime
from uuid import UUID

from src.types.app_state import AppState
from src.types.goal import LearningGoal
from src.types.plan import RoughPlanEntry, MonthPlan, TimeSlot
from src.types.session import StudySession, StopwatchState
from src.types.milestone import Milestone


def _default_encoder(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    if isinstance(obj, UUID):
        return str(obj)
    raise TypeError(f"Nicht serialisierbar: {type(obj)}")


def state_to_dict(state: AppState) -> dict:
    """Pure: AppState -> JSON-serialisierbares dict."""
    raw = asdict(state)
    return json.loads(json.dumps(raw, default=_default_encoder))


def _parse_date(s: str | None) -> date | None:
    return date.fromisoformat(s) if s else None


def _parse_datetime(s: str | None) -> datetime | None:
    return datetime.fromisoformat(s) if s else None


def _parse_uuid(s: str | None) -> UUID | None:
    return UUID(s) if s else None


def _goal_from_dict(d: dict) -> LearningGoal:
    return LearningGoal(
        id=UUID(d["id"]),
        title=d["title"],
        description=d["description"],
        target_hours=d["target_hours"],
        start_date=date.fromisoformat(d["start_date"]),
        end_date=date.fromisoformat(d["end_date"]),
        status=d["status"],
        tags=tuple(d.get("tags", [])),
    )


def _rough_plan_from_dict(d: dict) -> RoughPlanEntry:
    return RoughPlanEntry(
        goal_id=UUID(d["goal_id"]),
        year=d["year"],
        month=d["month"],
        planned_hours=d["planned_hours"],
        note=d.get("note", ""),
    )


def _time_slot_from_dict(d: dict) -> TimeSlot:
    return TimeSlot(
        date=date.fromisoformat(d["date"]),
        planned_minutes=d["planned_minutes"],
        note=d.get("note", ""),
    )


def _month_plan_from_dict(d: dict) -> MonthPlan:
    return MonthPlan(
        goal_id=UUID(d["goal_id"]),
        year=d["year"],
        month=d["month"],
        slots=tuple(_time_slot_from_dict(s) for s in d.get("slots", [])),
        intermediate_targets=tuple(d.get("intermediate_targets", [])),
    )


def _session_from_dict(d: dict) -> StudySession:
    return StudySession(
        id=UUID(d["id"]),
        goal_id=UUID(d["goal_id"]),
        started_at=datetime.fromisoformat(d["started_at"]),
        ended_at=datetime.fromisoformat(d["ended_at"]),
        duration_seconds=d["duration_seconds"],
        note=d.get("note", ""),
        rating=d.get("rating"),
    )


def _milestone_from_dict(d: dict) -> Milestone:
    return Milestone(
        id=UUID(d["id"]),
        goal_id=UUID(d["goal_id"]),
        title=d["title"],
        milestone_type=d["milestone_type"],
        target_date=date.fromisoformat(d["target_date"]),
        status=d["status"],
        achieved_at=_parse_date(d.get("achieved_at")),
        note=d.get("note", ""),
    )


def _stopwatch_from_dict(d: dict) -> StopwatchState:
    return StopwatchState(
        phase=d.get("phase", "idle"),
        started_at=_parse_datetime(d.get("started_at")),
        paused_at=_parse_datetime(d.get("paused_at")),
        accumulated_seconds=d.get("accumulated_seconds", 0),
        goal_id=_parse_uuid(d.get("goal_id")),
    )


def state_from_dict(data: dict) -> AppState:
    """Pure: dict -> AppState. Wirft ValueError bei korrupten Daten."""
    return AppState(
        goals=tuple(_goal_from_dict(g) for g in data.get("goals", [])),
        rough_plans=tuple(_rough_plan_from_dict(p) for p in data.get("rough_plans", [])),
        month_plans=tuple(_month_plan_from_dict(p) for p in data.get("month_plans", [])),
        sessions=tuple(_session_from_dict(s) for s in data.get("sessions", [])),
        milestones=tuple(_milestone_from_dict(m) for m in data.get("milestones", [])),
        stopwatch=_stopwatch_from_dict(data.get("stopwatch", {})),
        active_view=data.get("active_view", "dashboard"),
    )
