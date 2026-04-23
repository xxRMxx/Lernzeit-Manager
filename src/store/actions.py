from dataclasses import dataclass
from datetime import date, datetime
from uuid import UUID

from src.types.goal import LearningGoal, GoalStatus
from src.types.plan import RoughPlanEntry, MonthPlan, TimeSlot
from src.types.milestone import Milestone, MilestoneStatus


# --- Ziele ---

@dataclass(frozen=True)
class AddGoal:
    goal: LearningGoal


@dataclass(frozen=True)
class UpdateGoalStatus:
    goal_id: UUID
    status: GoalStatus


@dataclass(frozen=True)
class RemoveGoal:
    goal_id: UUID


# --- Stoppuhr ---

@dataclass(frozen=True)
class StartStopwatch:
    goal_id: UUID
    now: datetime


@dataclass(frozen=True)
class PauseStopwatch:
    now: datetime


@dataclass(frozen=True)
class ResumeStopwatch:
    now: datetime


@dataclass(frozen=True)
class StopStopwatch:
    now: datetime
    note: str = ""
    rating: int | None = None


# --- Planung ---

@dataclass(frozen=True)
class SetRoughPlanEntry:
    entry: RoughPlanEntry


@dataclass(frozen=True)
class AddTimeSlot:
    goal_id: UUID
    year: int
    month: int
    slot: TimeSlot


@dataclass(frozen=True)
class RemoveTimeSlot:
    goal_id: UUID
    year: int
    month: int
    slot_date: date


# --- Meilensteine ---

@dataclass(frozen=True)
class AddMilestone:
    milestone: Milestone


@dataclass(frozen=True)
class AchieveMilestone:
    milestone_id: UUID
    achieved_at: date


@dataclass(frozen=True)
class RemoveMilestone:
    milestone_id: UUID


# --- Sessions ---

@dataclass(frozen=True)
class RemoveSession:
    session_id: UUID


# --- Navigation ---

@dataclass(frozen=True)
class SetActiveView:
    view_name: str


# Union-Typ für alle Actions
Action = (
    AddGoal | UpdateGoalStatus | RemoveGoal |
    StartStopwatch | PauseStopwatch | ResumeStopwatch | StopStopwatch |
    SetRoughPlanEntry | AddTimeSlot | RemoveTimeSlot |
    AddMilestone | AchieveMilestone | RemoveMilestone |
    RemoveSession |
    SetActiveView
)
