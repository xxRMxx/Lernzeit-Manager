from datetime import date
from uuid import uuid4

import flet as ft

from src.store.store import Store
from src.store.actions import AddGoal, UpdateGoalStatus, RemoveGoal
from src.types.app_state import AppState
from src.types.goal import LearningGoal
from src.logic.planning import completion_ratio, total_studied_hours, days_remaining
from src.views.components.progress_bar import labeled_progress_bar


from src.utils.date_parser import parse_german_date


def _goal_card(goal: LearningGoal, state: AppState, store: Store, page: ft.Page) -> ft.Control:
    ratio = completion_ratio(goal, state.sessions)
    studied = total_studied_hours(goal.id, state.sessions)
    remaining = days_remaining(goal, date.today())

    status_colors = {
        "active": ft.Colors.GREEN,
        "completed": ft.Colors.BLUE,
        "abandoned": ft.Colors.RED,
    }
    status_labels = {
        "active": "Aktiv",
        "completed": "Abgeschlossen",
        "abandoned": "Aufgegeben",
    }

    def on_complete(e):
        store.dispatch(UpdateGoalStatus(goal_id=goal.id, status="completed"))

    def on_abandon(e):
        store.dispatch(UpdateGoalStatus(goal_id=goal.id, status="abandoned"))

    def on_delete(e):
        def confirm_delete(e):
            store.dispatch(RemoveGoal(goal_id=goal.id))
            page.pop_dialog()

        dlg = ft.AlertDialog(
            title=ft.Text("Ziel löschen?"),
            content=ft.Text(f'"{goal.title}" wird unwiderruflich gelöscht.'),
            actions=[
                ft.TextButton("Abbrechen", on_click=lambda e: page.pop_dialog()),
                ft.TextButton("Löschen", on_click=confirm_delete, style=ft.ButtonStyle(color=ft.Colors.RED)),
            ],
        )
        page.show_dialog(dlg)

    actions = []
    if goal.status == "active":
        actions.append(
            ft.TextButton("Abschließen", icon=ft.Icons.CHECK_CIRCLE, on_click=on_complete)
        )
        actions.append(
            ft.TextButton("Aufgeben", icon=ft.Icons.CANCEL, on_click=on_abandon,
                          style=ft.ButtonStyle(color=ft.Colors.ORANGE))
        )
    actions.append(
        ft.IconButton(ft.Icons.DELETE_OUTLINE, on_click=on_delete, icon_color=ft.Colors.RED)
    )

    return ft.Card(
        content=ft.Container(
            content=ft.Column([
                ft.Row([
                    ft.Column([
                        ft.Text(goal.title, size=16, weight=ft.FontWeight.BOLD),
                        ft.Text(
                            f"{goal.start_date.strftime('%d.%m.%Y')} – {goal.end_date.strftime('%d.%m.%Y')}",
                            size=12, color=ft.Colors.ON_SURFACE_VARIANT,
                        ),
                    ], expand=True),
                    ft.Container(
                        content=ft.Text(
                            status_labels[goal.status], size=11, color=ft.Colors.WHITE,
                            weight=ft.FontWeight.BOLD,
                        ),
                        bgcolor=status_colors[goal.status],
                        padding=ft.padding.symmetric(horizontal=8, vertical=3),
                        border_radius=12,
                    ),
                ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                ft.Text(goal.description, size=13, color=ft.Colors.ON_SURFACE_VARIANT)
                if goal.description else ft.Container(),
                labeled_progress_bar(
                    f"{studied:.1f}h von {goal.target_hours:.0f}h gelernt",
                    ratio,
                ),
                ft.Row([
                    ft.Text(
                        f"Noch {remaining} Tage" if goal.status == "active" else "",
                        size=11, color=ft.Colors.ON_SURFACE_VARIANT,
                    ),
                    ft.Row(actions),
                ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
            ], spacing=8),
            padding=16,
        ),
        elevation=2,
        margin=ft.margin.symmetric(vertical=4),
    )


def _goal_form_dialog(store: Store, page: ft.Page) -> ft.AlertDialog:
    title_field = ft.TextField(label="Titel *", hint_text="z.B. Mathematik I bestehen", autofocus=True)
    description_field = ft.TextField(label="Beschreibung", multiline=True, max_lines=3)
    hours_field = ft.TextField(label="Geplante Stunden *", hint_text="z.B. 60", keyboard_type=ft.KeyboardType.NUMBER, value="60")
    start_field = ft.TextField(label="Startdatum", hint_text="TT.MM.JJJJ", value=date.today().strftime("%d.%m.%Y"))
    end_field = ft.TextField(label="Enddatum", hint_text="TT.MM.JJJJ")
    error_text = ft.Text("", color=ft.Colors.RED, size=12)

    def on_save(e):
        error_text.value = ""
        try:
            if not title_field.value or not title_field.value.strip():
                error_text.value = "Bitte Titel eingeben."
                error_text.update()
                return
            hours = float(hours_field.value or "0")
            if hours <= 0:
                error_text.value = "Bitte gültige Stundenzahl eingeben."
                error_text.update()
                return
            
            start = parse_german_date(start_field.value)
            end = parse_german_date(end_field.value)
            
            if not start or not end:
                raise ValueError("Ungültiges Datum")
            
            if end <= start:
                error_text.value = "Enddatum muss nach Startdatum liegen."
                error_text.update()
                return

            goal = LearningGoal(
                id=uuid4(),
                title=title_field.value.strip(),
                description=description_field.value.strip() if description_field.value else "",
                target_hours=hours,
                start_date=start,
                end_date=end,
            )
            store.dispatch(AddGoal(goal=goal))
            page.pop_dialog()
        except (ValueError, AttributeError):
            error_text.value = "Bitte gültige Daten eingeben (Datum: TT.MM.JJJJ)."
            error_text.update()

    dlg = ft.AlertDialog(
        title=ft.Text("Neues Lernziel"),
        content=ft.Column(
            [title_field, description_field, hours_field, start_field, end_field, error_text],
            width=400,
            tight=True,
            spacing=8,
        ),
        actions=[
            ft.TextButton("Abbrechen", on_click=lambda e: page.pop_dialog()),
            ft.ElevatedButton("Speichern", on_click=on_save),
        ],
    )
    return dlg


def build_goals_view(state: AppState, store: Store, page: ft.Page) -> ft.Control:
    """Pure View-Funktion: (AppState, Store, Page) -> ft.Control."""

    def on_add(e):
        dlg = _goal_form_dialog(store, page)
        page.show_dialog(dlg)

    if not state.goals:
        empty_state = ft.Column(
            [
                ft.Icon(ft.Icons.SCHOOL_OUTLINED, size=64, color=ft.Colors.ON_SURFACE_VARIANT),
                ft.Text("Noch keine Lernziele", size=16, color=ft.Colors.ON_SURFACE_VARIANT),
                ft.Text(
                    "Erstelle dein erstes Lernziel mit dem + Button.",
                    size=13, color=ft.Colors.ON_SURFACE_VARIANT,
                ),
            ],
            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
            alignment=ft.MainAxisAlignment.CENTER,
        )
        body = ft.Container(empty_state, expand=True, alignment=ft.Alignment(0, 0))
    else:
        goal_cards = [_goal_card(g, state, store, page) for g in state.goals]
        body = ft.ListView(controls=goal_cards, expand=True, padding=16, spacing=4)

    return ft.Stack(
        [
            body,
            ft.FloatingActionButton(
                icon=ft.Icons.ADD,
                on_click=on_add,
                tooltip="Neues Lernziel",
            ),
        ],
        expand=True,
    )
