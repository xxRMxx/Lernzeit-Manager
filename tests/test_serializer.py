"""Round-trip Tests: AppState -> dict -> AppState muss verlustfrei sein."""
from datetime import date, datetime
from uuid import uuid4

from src.types.app_state import AppState
from src.types.goal import LearningGoal
from src.types.session import StudySession
from src.types.milestone import Milestone
from src.persistence.serializer import state_to_dict, state_from_dict


def make_full_state() -> AppState:
    gid = uuid4()
    goal = LearningGoal(
        id=gid,
        title="Mathematik I",
        description="Modul bestehen",
        target_hours=60.0,
        start_date=date(2025, 1, 1),
        end_date=date(2025, 6, 30),
        tags=("Pflicht", "Mathe"),
    )
    session = StudySession(
        id=uuid4(),
        goal_id=gid,
        started_at=datetime(2025, 3, 1, 10, 0),
        ended_at=datetime(2025, 3, 1, 11, 30),
        duration_seconds=5400,
        note="Kapitel 3",
        rating=4,
    )
    milestone = Milestone(
        id=uuid4(),
        goal_id=gid,
        title="Klausur bestanden",
        milestone_type="exam_passed",
        target_date=date(2025, 6, 15),
    )
    return AppState(
        goals=(goal,),
        sessions=(session,),
        milestones=(milestone,),
    )


def test_round_trip_empty_state():
    state = AppState()
    restored = state_from_dict(state_to_dict(state))
    assert restored.goals == ()
    assert restored.sessions == ()
    assert restored.stopwatch.phase == "idle"


def test_round_trip_full_state():
    state = make_full_state()
    restored = state_from_dict(state_to_dict(state))

    assert len(restored.goals) == 1
    assert restored.goals[0].title == "Mathematik I"
    assert restored.goals[0].tags == ("Pflicht", "Mathe")
    assert restored.goals[0].start_date == date(2025, 1, 1)

    assert len(restored.sessions) == 1
    assert restored.sessions[0].duration_seconds == 5400
    assert restored.sessions[0].rating == 4
    assert restored.sessions[0].note == "Kapitel 3"

    assert len(restored.milestones) == 1
    assert restored.milestones[0].milestone_type == "exam_passed"


def test_goal_id_preserved():
    state = make_full_state()
    restored = state_from_dict(state_to_dict(state))
    assert restored.goals[0].id == state.goals[0].id
    assert restored.sessions[0].goal_id == state.goals[0].id
