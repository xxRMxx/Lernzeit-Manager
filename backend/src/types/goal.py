from dataclasses import dataclass, field
from datetime import date
from typing import Literal
from uuid import UUID

GoalStatus = Literal["active", "completed", "abandoned"]


@dataclass(frozen=True)
class LearningGoal:
    id: UUID
    title: str
    description: str
    target_hours: float
    start_date: date
    end_date: date
    status: GoalStatus = "active"
    tags: tuple[str, ...] = field(default_factory=tuple)
