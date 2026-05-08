from dataclasses import dataclass, field

from .goal import LearningGoal
from .plan import RoughPlanEntry, MonthPlan
from .session import StudySession, StopwatchState
from .milestone import Milestone


@dataclass(frozen=True)
class AppState:
    """Einzige Quelle der Wahrheit. Unveränderlich."""
    goals: tuple[LearningGoal, ...] = field(default_factory=tuple)
    rough_plans: tuple[RoughPlanEntry, ...] = field(default_factory=tuple)
    month_plans: tuple[MonthPlan, ...] = field(default_factory=tuple)
    sessions: tuple[StudySession, ...] = field(default_factory=tuple)
    milestones: tuple[Milestone, ...] = field(default_factory=tuple)
    stopwatch: StopwatchState = field(default_factory=StopwatchState)
    active_view: str = "dashboard"
