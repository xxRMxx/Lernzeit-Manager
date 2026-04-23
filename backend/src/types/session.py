from dataclasses import dataclass
from datetime import datetime
from typing import Literal
from uuid import UUID

StopwatchPhase = Literal["idle", "running", "paused", "finished"]


@dataclass(frozen=True)
class StopwatchState:
    phase: StopwatchPhase = "idle"
    started_at: datetime | None = None
    paused_at: datetime | None = None
    accumulated_seconds: int = 0  # Bereits gestoppte Sekunden vor Pause
    goal_id: UUID | None = None


@dataclass(frozen=True)
class StudySession:
    id: UUID
    goal_id: UUID
    started_at: datetime
    ended_at: datetime
    duration_seconds: int
    note: str = ""
    rating: int | None = None  # 1-5
