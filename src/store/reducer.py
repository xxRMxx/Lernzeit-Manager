from dataclasses import replace
from src.types.app_state import AppState
from src.types.plan import MonthPlan
from src.logic import stopwatch as sw_logic
from src.store.actions import (
    Action,
    AddGoal, UpdateGoalStatus, RemoveGoal,
    StartStopwatch, PauseStopwatch, ResumeStopwatch, StopStopwatch,
    SetRoughPlanEntry, AddTimeSlot, RemoveTimeSlot,
    AddMilestone, AchieveMilestone, RemoveMilestone,
    RemoveSession,
    SetActiveView,
)

def reduce(state: AppState, action: Action) -> AppState:
    """
    Pure function: AppState x Action -> AppState.
    No IO, no side effects.
    """
    match action:
        # --- Goals ---
        case AddGoal() | UpdateGoalStatus() | RemoveGoal():
            return _reduce_goals(state, action)

        # --- Stopwatch ---
        case StartStopwatch() | PauseStopwatch() | ResumeStopwatch() | StopStopwatch():
            return _reduce_stopwatch(state, action)

        # --- Planning ---
        case SetRoughPlanEntry() | AddTimeSlot() | RemoveTimeSlot():
            return _reduce_planning(state, action)

        # --- Milestones ---
        case AddMilestone() | AchieveMilestone() | RemoveMilestone():
            return _reduce_milestones(state, action)

        # --- Sessions ---
        case RemoveSession():
            return _reduce_sessions(state, action)

        # --- Navigation ---
        case SetActiveView():
            return _reduce_navigation(state, action)

        case _:
            return state

def _reduce_goals(state: AppState, action: Action) -> AppState:
    match action:
        case AddGoal(goal=g):
            return replace(state, goals=(*state.goals, g))

        case UpdateGoalStatus(goal_id=gid, status=s):
            updated = tuple(
                replace(g, status=s) if g.id == gid else g
                for g in state.goals
            )
            return replace(state, goals=updated)

        case RemoveGoal(goal_id=gid):
            return replace(state, goals=tuple(g for g in state.goals if g.id != gid))
    return state

def _reduce_stopwatch(state: AppState, action: Action) -> AppState:
    match action:
        case StartStopwatch(goal_id=gid, now=now):
            new_sw = sw_logic.start_stopwatch(state.stopwatch, gid, now)
            return replace(state, stopwatch=new_sw)

        case PauseStopwatch(now=now):
            new_sw = sw_logic.pause_stopwatch(state.stopwatch, now)
            return replace(state, stopwatch=new_sw)

        case ResumeStopwatch(now=now):
            new_sw = sw_logic.resume_stopwatch(state.stopwatch, now)
            return replace(state, stopwatch=new_sw)

        case StopStopwatch(now=now, note=note, rating=rating):
            new_sw, session = sw_logic.stop_stopwatch(state.stopwatch, now, note, rating)
            new_sessions = (*state.sessions, session) if session else state.sessions
            return replace(state, stopwatch=new_sw, sessions=new_sessions)
    return state

def _reduce_planning(state: AppState, action: Action) -> AppState:
    match action:
        case SetRoughPlanEntry(entry=entry):
            other = tuple(
                p for p in state.rough_plans
                if not (p.goal_id == entry.goal_id and p.year == entry.year and p.month == entry.month)
            )
            return replace(state, rough_plans=(*other, entry))

        case AddTimeSlot(goal_id=gid, year=y, month=m, slot=slot):
            existing = next(
                (p for p in state.month_plans if p.goal_id == gid and p.year == y and p.month == m),
                None,
            )
            if existing:
                other_slots = tuple(s for s in existing.slots if s.date != slot.date)
                updated_plan = replace(existing, slots=(*other_slots, slot))
                other_plans = tuple(p for p in state.month_plans if p is not existing)
                return replace(state, month_plans=(*other_plans, updated_plan))
            else:
                new_plan = MonthPlan(goal_id=gid, year=y, month=m, slots=(slot,))
                return replace(state, month_plans=(*state.month_plans, new_plan))

        case RemoveTimeSlot(goal_id=gid, year=y, month=m, slot_date=d):
            updated_plans = []
            for plan in state.month_plans:
                if plan.goal_id == gid and plan.year == y and plan.month == m:
                    new_slots = tuple(s for s in plan.slots if s.date != d)
                    updated_plans.append(replace(plan, slots=new_slots))
                else:
                    updated_plans.append(plan)
            return replace(state, month_plans=tuple(updated_plans))
    return state

def _reduce_milestones(state: AppState, action: Action) -> AppState:
    match action:
        case AddMilestone(milestone=ms):
            return replace(state, milestones=(*state.milestones, ms))

        case AchieveMilestone(milestone_id=mid, achieved_at=achieved_at):
            updated = tuple(
                replace(ms, status="achieved", achieved_at=achieved_at)
                if ms.id == mid else ms
                for ms in state.milestones
            )
            return replace(state, milestones=updated)

        case RemoveMilestone(milestone_id=mid):
            return replace(
                state,
                milestones=tuple(ms for ms in state.milestones if ms.id != mid),
            )
    return state

def _reduce_sessions(state: AppState, action: Action) -> AppState:
    match action:
        case RemoveSession(session_id=sid):
            return replace(state, sessions=tuple(s for s in state.sessions if s.id != sid))
    return state

def _reduce_navigation(state: AppState, action: Action) -> AppState:
    match action:
        case SetActiveView(view_name=name):
            return replace(state, active_view=name)
    return state
