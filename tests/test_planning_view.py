import pytest
from unittest.mock import MagicMock
from datetime import date
from uuid import uuid4

import flet as ft
from src.views.planning.planning_view import _build_month_plan
from src.types.app_state import AppState
from src.types.goal import LearningGoal

def test_invalid_minutes_handling():
    store = MagicMock()
    page = MagicMock()

    # Setup state with one active goal to trigger slot chips
    goal = LearningGoal(id=uuid4(), title="Test Goal", description="", target_hours=10, start_date=date(2023, 1, 1), end_date=date(2023, 12, 31), status="active")
    state = AppState(goals=[goal], rough_plans=[], month_plans=[], sessions=[], milestones=[])

    # Call _build_month_plan
    view = _build_month_plan(state, store, page)

    # Extract the add button from the first day
    content_col = view.controls[2] # the column
    first_day_row = content_col.controls[0] # first day
    # first_day_row.controls[1] is the row with chips and add btn
    add_btn = first_day_row.controls[1].controls[-1]

    # Click add button to open dialog
    add_btn.on_click(None)

    # Get the dialog passed to page.show_dialog
    page.show_dialog.assert_called_once()
    dialog = page.show_dialog.call_args[0][0]

    # Find the minutes field and set invalid value
    # content is a Column, controls[1] is the minutes field
    minutes_field = dialog.content.controls[1]
    minutes_field.value = "invalid"

    # Click save button
    save_btn = dialog.actions[1]
    save_btn.on_click(None)

    # Verify store.dispatch was NOT called because of ValueError
    store.dispatch.assert_not_called()


def test_missing_minutes_handling():
    store = MagicMock()
    page = MagicMock()

    # Setup state with one active goal
    goal = LearningGoal(id=uuid4(), title="Test Goal", description="", target_hours=10, start_date=date(2023, 1, 1), end_date=date(2023, 12, 31), status="active")
    state = AppState(goals=[goal], rough_plans=[], month_plans=[], sessions=[], milestones=[])

    view = _build_month_plan(state, store, page)

    # Trigger add dialog
    view.controls[2].controls[0].controls[1].controls[-1].on_click(None)
    dialog = page.show_dialog.call_args[0][0]

    # Test with empty value
    minutes_field = dialog.content.controls[1]
    minutes_field.value = ""

    # Click save button
    save_btn = dialog.actions[1]
    save_btn.on_click(None)

    # Should fall back to "0" and trigger the early return (mins <= 0)
    store.dispatch.assert_not_called()

def test_negative_minutes_handling():
    store = MagicMock()
    page = MagicMock()

    # Setup state with one active goal
    goal = LearningGoal(id=uuid4(), title="Test Goal", description="", target_hours=10, start_date=date(2023, 1, 1), end_date=date(2023, 12, 31), status="active")
    state = AppState(goals=[goal], rough_plans=[], month_plans=[], sessions=[], milestones=[])

    view = _build_month_plan(state, store, page)

    # Trigger add dialog
    view.controls[2].controls[0].controls[1].controls[-1].on_click(None)
    dialog = page.show_dialog.call_args[0][0]

    # Test with negative value
    minutes_field = dialog.content.controls[1]
    minutes_field.value = "-10"

    # Click save button
    save_btn = dialog.actions[1]
    save_btn.on_click(None)

    # Should trigger the early return (mins <= 0)
    store.dispatch.assert_not_called()

def test_valid_minutes_handling():
    store = MagicMock()
    page = MagicMock()

    # Setup state with one active goal
    goal = LearningGoal(id=uuid4(), title="Test Goal", description="", target_hours=10, start_date=date(2023, 1, 1), end_date=date(2023, 12, 31), status="active")
    state = AppState(goals=[goal], rough_plans=[], month_plans=[], sessions=[], milestones=[])

    view = _build_month_plan(state, store, page)

    # Trigger add dialog
    view.controls[2].controls[0].controls[1].controls[-1].on_click(None)
    dialog = page.show_dialog.call_args[0][0]

    # Test with valid value
    minutes_field = dialog.content.controls[1]
    minutes_field.value = "45"

    note_field = dialog.content.controls[2]
    note_field.value = "Test Note"

    # Click save button
    save_btn = dialog.actions[1]
    save_btn.on_click(None)

    # Verify store.dispatch WAS called correctly
    store.dispatch.assert_called_once()
    action = store.dispatch.call_args[0][0]

    assert action.__class__.__name__ == "AddTimeSlot"
    assert action.slot.planned_minutes == 45
    assert action.slot.note == "Test Note"

    page.pop_dialog.assert_called_once()
