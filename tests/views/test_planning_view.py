import flet as ft
from uuid import uuid4
from datetime import date

from src.types.app_state import AppState
from src.types.goal import LearningGoal
from src.views.planning.planning_view import _build_rough_plan

class MockStore:
    def __init__(self):
        self.actions = []

    def dispatch(self, action):
        self.actions.append(action)

def find_text_fields(control):
    tfs = []
    if isinstance(control, ft.TextField):
        tfs.append(control)
    if hasattr(control, "controls"):
        for c in control.controls:
            tfs.extend(find_text_fields(c))
    if hasattr(control, "content") and control.content:
        tfs.extend(find_text_fields(control.content))
    if hasattr(control, "tabs"):
        for t in control.tabs:
             tfs.extend(find_text_fields(t.content) if hasattr(t, "content") else [])
    return tfs

def test_rough_plan_invalid_hours_does_not_dispatch():
    """
    Testet, dass bei Eingabe eines ungültigen Wertes (z.B. Text statt Zahl)
    in das Stundenfeld des Grobplans keine Exception geworfen und
    kein Action an den Store dispatcht wird.
    """
    goal = LearningGoal(
        id=uuid4(),
        title="Test Goal",
        description="Test",
        target_hours=100.0,
        start_date=date(2025, 1, 1),
        end_date=date(2025, 12, 31),
        status="active"
    )
    state = AppState(goals=(goal,))
    store = MockStore()

    view = _build_rough_plan(state, store, None)

    tfs = find_text_fields(view)
    assert len(tfs) > 0, "Es sollten Textfelder für die Planung existieren"

    tf = tfs[0]

    # Simuliere eine ungültige Eingabe
    tf.value = "keine_zahl"

    # Sollte die ValueError-Exception in on_blur abfangen
    tf.on_blur(None)

    # Kein Action sollte dispatcht werden
    assert len(store.actions) == 0

def test_rough_plan_valid_hours_dispatches():
    """
    Testet, dass bei einer gültigen Eingabe ein entsprechendes
    SetRoughPlanEntry Action dispatcht wird.
    """
    goal = LearningGoal(
        id=uuid4(),
        title="Test Goal",
        description="Test",
        target_hours=100.0,
        start_date=date(2025, 1, 1),
        end_date=date(2025, 12, 31),
        status="active"
    )
    state = AppState(goals=(goal,))
    store = MockStore()

    view = _build_rough_plan(state, store, None)

    tfs = find_text_fields(view)
    assert len(tfs) > 0, "Es sollten Textfelder für die Planung existieren"

    tf = tfs[0]

    # Simuliere eine gültige Eingabe
    tf.value = "42.5"
    tf.on_blur(None)

    assert len(store.actions) == 1
    action = store.actions[0]
    # Der Action-Typ sollte SetRoughPlanEntry sein
    assert action.__class__.__name__ == "SetRoughPlanEntry"
    assert action.entry.planned_hours == 42.5
    assert action.entry.goal_id == goal.id

def test_rough_plan_negative_hours_does_not_dispatch():
    """
    Testet, dass bei einer negativen Eingabe kein
    SetRoughPlanEntry Action dispatcht wird.
    """
    goal = LearningGoal(
        id=uuid4(),
        title="Test Goal",
        description="Test",
        target_hours=100.0,
        start_date=date(2025, 1, 1),
        end_date=date(2025, 12, 31),
        status="active"
    )
    state = AppState(goals=(goal,))
    store = MockStore()

    view = _build_rough_plan(state, store, None)

    tfs = find_text_fields(view)
    tf = tfs[0]

    # Simuliere eine negative Eingabe
    tf.value = "-5"
    tf.on_blur(None)

    assert len(store.actions) == 0
