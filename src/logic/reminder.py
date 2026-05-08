from datetime import datetime, timedelta

from src.types.app_state import AppState
from src.logic.planning import overdue_slots

INACTIVITY_THRESHOLD = timedelta(hours=24)


def last_activity(state: AppState) -> datetime | None:
    """Pure: Zeitpunkt der letzten abgeschlossenen Lernsession."""
    if not state.sessions:
        return None
    return max(s.ended_at for s in state.sessions)


def is_inactive(state: AppState, now: datetime) -> bool:
    """Pure: True wenn seit mehr als INACTIVITY_THRESHOLD keine Session."""
    la = last_activity(state)
    if la is None:
        return bool(state.goals)  # Nur inaktiv wenn Ziele vorhanden
    return (now - la) > INACTIVITY_THRESHOLD


def get_reminders(state: AppState, now: datetime) -> list[str]:
    """
    Pure: Liste von Erinnerungstexten die angezeigt werden sollen.
    Leer wenn keine Erinnerungen notwendig.
    """
    reminders = []

    if is_inactive(state, now) and state.goals:
        la = last_activity(state)
        if la is None:
            reminders.append("Du hast noch keine Lernzeit erfasst. Starte jetzt!")
        else:
            hours_ago = int((now - la).total_seconds() / 3600)
            reminders.append(
                f"Du hast seit {hours_ago} Stunden nicht gelernt. "
                "Zeit für eine Lerneinheit?"
            )

    missed = overdue_slots(state.month_plans, state.sessions, now.date())
    if missed:
        reminders.append(
            f"{len(missed)} geplante Lerneinheit(en) wurden nicht erledigt."
        )

    return reminders
