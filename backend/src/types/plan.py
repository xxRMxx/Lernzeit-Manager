from dataclasses import dataclass, field
from datetime import date
from uuid import UUID


@dataclass(frozen=True)
class TimeSlot:
    date: date
    planned_minutes: int
    note: str = ""


@dataclass(frozen=True)
class MonthPlan:
    """Detailplanung für genau einen Monat."""
    goal_id: UUID
    year: int
    month: int  # 1-12
    slots: tuple[TimeSlot, ...] = field(default_factory=tuple)
    intermediate_targets: tuple[str, ...] = field(default_factory=tuple)


@dataclass(frozen=True)
class RoughPlanEntry:
    """Grobplanung: pro Monat eine Stundenzahl pro Ziel."""
    goal_id: UUID
    year: int
    month: int  # 1-12
    planned_hours: float
    note: str = ""
