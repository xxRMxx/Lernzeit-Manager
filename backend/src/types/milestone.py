from dataclasses import dataclass
from datetime import date
from typing import Literal
from uuid import UUID

MilestoneType = Literal[
    "module_completed", "exam_passed", "report_submitted", "custom"
]
MilestoneStatus = Literal["planned", "achieved", "missed"]


@dataclass(frozen=True)
class Milestone:
    id: UUID
    goal_id: UUID
    title: str
    milestone_type: MilestoneType
    target_date: date
    status: MilestoneStatus = "planned"
    achieved_at: date | None = None
    note: str = ""
