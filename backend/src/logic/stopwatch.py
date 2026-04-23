from datetime import datetime
from uuid import UUID, uuid4

from src.types.session import StopwatchState, StudySession


def elapsed_seconds(sw: StopwatchState, now: datetime) -> int:
    """Pure: berechnet aktuelle Netto-Laufzeit ohne State zu mutieren."""
    if sw.phase == "idle" or sw.started_at is None:
        return sw.accumulated_seconds
    if sw.phase == "paused":
        return sw.accumulated_seconds
    return sw.accumulated_seconds + int((now - sw.started_at).total_seconds())


def start_stopwatch(sw: StopwatchState, goal_id: UUID, now: datetime) -> StopwatchState:
    """Pure: gibt neuen StopwatchState zurück mit phase=running."""
    if sw.phase == "running":
        return sw
    return StopwatchState(
        phase="running",
        started_at=now,
        paused_at=None,
        accumulated_seconds=sw.accumulated_seconds,
        goal_id=goal_id,
    )


def pause_stopwatch(sw: StopwatchState, now: datetime) -> StopwatchState:
    """Pure: pausiert die Stoppuhr und speichert bisher gelaufene Zeit."""
    if sw.phase != "running" or sw.started_at is None:
        return sw
    secs = sw.accumulated_seconds + int((now - sw.started_at).total_seconds())
    return StopwatchState(
        phase="paused",
        started_at=None,
        paused_at=now,
        accumulated_seconds=secs,
        goal_id=sw.goal_id,
    )


def resume_stopwatch(sw: StopwatchState, now: datetime) -> StopwatchState:
    """Pure: setzt eine pausierte Stoppuhr fort."""
    if sw.phase != "paused":
        return sw
    return StopwatchState(
        phase="running",
        started_at=now,
        paused_at=None,
        accumulated_seconds=sw.accumulated_seconds,
        goal_id=sw.goal_id,
    )


def stop_stopwatch(
    sw: StopwatchState,
    now: datetime,
    note: str = "",
    rating: int | None = None,
) -> tuple[StopwatchState, StudySession | None]:
    """
    Pure: beendet die Stoppuhr.
    Gibt (resetted_state, session) zurück. Session ist None wenn keine Zeit aufgezeichnet.
    """
    if sw.phase == "idle" or sw.goal_id is None:
        return StopwatchState(), None

    total_secs = elapsed_seconds(sw, now)
    if total_secs < 1:
        return StopwatchState(), None

    started = sw.started_at or now
    session = StudySession(
        id=uuid4(),
        goal_id=sw.goal_id,
        started_at=started,
        ended_at=now,
        duration_seconds=total_secs,
        note=note,
        rating=rating,
    )
    return StopwatchState(), session


def format_seconds(total_seconds: int) -> str:
    """Pure: formatiert Sekunden als HH:MM:SS."""
    h, remainder = divmod(abs(total_seconds), 3600)
    m, s = divmod(remainder, 60)
    return f"{h:02d}:{m:02d}:{s:02d}"
