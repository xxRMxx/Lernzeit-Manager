from datetime import date
from uuid import uuid4

import flet as ft

from src.store.store import Store
from src.store.actions import AddMilestone, AchieveMilestone, RemoveMilestone
from src.types.app_state import AppState
from src.types.milestone import Milestone
from src.utils.date_parser import parse_german_date


_TYPE_LABELS = {
    "module_completed": "Modul abgeschlossen",
    "exam_passed": "Klausur bestanden",
    "report_submitted": "Bericht eingereicht",
    "custom": "Benutzerdefiniert",
}
_TYPE_ICONS = {
    "module_completed": ft.Icons.MENU_BOOK,
    "exam_passed": ft.Icons.SCHOOL,
    "report_submitted": ft.Icons.DESCRIPTION,
    "custom": ft.Icons.STAR,
}
_STATUS_COLORS = {
    "planned": ft.Colors.BLUE,
    "achieved": ft.Colors.GREEN,
    "missed": ft.Colors.RED,
}
_STATUS_LABELS = {
    "planned": "Geplant",
    "achieved": "Erreicht",
    "missed": "Verpasst",
}


def _milestone_card(ms: Milestone, state: AppState, store: Store, page: ft.Page) -> ft.Control:
    goal = next((g for g in state.goals if g.id == ms.goal_id), None)
    goal_title = goal.title if goal else "Unbekannt"

    def on_achieve(e):
        store.dispatch(AchieveMilestone(milestone_id=ms.id, achieved_at=date.today()))

    def on_delete(e):
        def confirm(e):
            store.dispatch(RemoveMilestone(milestone_id=ms.id))
            page.pop_dialog()
        dlg = ft.AlertDialog(
            title=ft.Text("Meilenstein löschen?"),
            content=ft.Text(f'"{ms.title}" löschen?'),
            actions=[
                ft.TextButton("Abbrechen", on_click=lambda e: page.pop_dialog()),
                ft.TextButton("Löschen", on_click=confirm, style=ft.ButtonStyle(color=ft.Colors.RED)),
            ],
        )
        page.show_dialog(dlg)

    actions = []
    if ms.status == "planned":
        actions.append(ft.TextButton("Als erreicht markieren", icon=ft.Icons.CHECK, on_click=on_achieve))
    actions.append(ft.IconButton(ft.Icons.DELETE_OUTLINE, on_click=on_delete, icon_color=ft.Colors.RED))

    achieved_info = ""
    if ms.achieved_at:
        achieved_info = f" · Erreicht: {ms.achieved_at.strftime('%d.%m.%Y')}"

    return ft.Card(
        content=ft.Container(
            content=ft.Row([
                ft.Icon(_TYPE_ICONS.get(ms.milestone_type, ft.Icons.STAR), size=32, color=ft.Colors.PRIMARY),
                ft.Column([
                    ft.Text(ms.title, size=14, weight=ft.FontWeight.BOLD),
                    ft.Text(f"{goal_title} · {_TYPE_LABELS[ms.milestone_type]}", size=12, color=ft.Colors.ON_SURFACE_VARIANT),
                    ft.Text(
                        f"Zieldatum: {ms.target_date.strftime('%d.%m.%Y')}{achieved_info}",
                        size=12, color=ft.Colors.ON_SURFACE_VARIANT,
                    ),
                ], expand=True, spacing=2),
                ft.Column([
                    ft.Container(
                        content=ft.Text(_STATUS_LABELS[ms.status], size=11, color=ft.Colors.WHITE, weight=ft.FontWeight.BOLD),
                        bgcolor=_STATUS_COLORS[ms.status],
                        padding=ft.padding.symmetric(horizontal=8, vertical=3),
                        border_radius=12,
                    ),
                    ft.Row(actions, spacing=0),
                ], horizontal_alignment=ft.CrossAxisAlignment.END),
            ], spacing=12, alignment=ft.MainAxisAlignment.START),
            padding=12,
        ),
        elevation=2,
        margin=ft.margin.symmetric(vertical=4),
    )


def _milestone_form_dialog(state: AppState, store: Store, page: ft.Page) -> ft.AlertDialog:
    active_goals = [g for g in state.goals if g.status == "active"]
    if not active_goals:
        return ft.AlertDialog(
            title=ft.Text("Kein aktives Ziel"),
            content=ft.Text("Erstelle zuerst ein aktives Lernziel."),
            actions=[ft.TextButton("OK", on_click=lambda e: page.pop_dialog())],
        )

    title_field = ft.TextField(label="Bezeichnung *", autofocus=True)
    goal_dropdown = ft.Dropdown(
        label="Lernziel *",
        options=[ft.dropdown.Option(key=str(g.id), text=g.title) for g in active_goals],
        value=str(active_goals[0].id),
    )
    type_dropdown = ft.Dropdown(
        label="Art des Meilensteins",
        options=[ft.dropdown.Option(key=k, text=v) for k, v in _TYPE_LABELS.items()],
        value="custom",
    )
    date_field = ft.TextField(label="Zieldatum", hint_text="TT.MM.JJJJ")
    note_field = ft.TextField(label="Notiz", multiline=True, max_lines=2)
    error_text = ft.Text("", color=ft.Colors.RED, size=12)

    def on_save(e):
        error_text.value = ""
        try:
            if not title_field.value or not title_field.value.strip():
                error_text.value = "Bitte Bezeichnung eingeben."
                error_text.update()
                return
            
            target = parse_german_date(date_field.value)
            if not target:
                raise ValueError("Ungültiges Datum")
            
            from uuid import UUID
            ms = Milestone(
                id=uuid4(),
                goal_id=UUID(goal_dropdown.value),
                title=title_field.value.strip(),
                milestone_type=type_dropdown.value,
                target_date=target,
                note=note_field.value.strip() if note_field.value else "",
            )
            store.dispatch(AddMilestone(milestone=ms))
            page.pop_dialog()
        except (ValueError, AttributeError):
            error_text.value = "Bitte gültiges Datum eingeben (TT.MM.JJJJ)."
            error_text.update()

    dlg = ft.AlertDialog(
        title=ft.Text("Neuer Meilenstein"),
        content=ft.Column(
            [goal_dropdown, title_field, type_dropdown, date_field, note_field, error_text],
            width=400, tight=True, spacing=8,
        ),
        actions=[
            ft.TextButton("Abbrechen", on_click=lambda e: page.pop_dialog()),
            ft.ElevatedButton("Speichern", on_click=on_save),
        ],
    )
    return dlg


def build_milestones_view(state: AppState, store: Store, page: ft.Page) -> ft.Control:
    filter_state = {"value": "all"}

    def filtered_milestones():
        f = filter_state["value"]
        if f == "all":
            return list(state.milestones)
        return [m for m in state.milestones if m.status == f]

    def on_add(e):
        dlg = _milestone_form_dialog(state, store, page)
        page.show_dialog(dlg)

    milestones = list(state.milestones)
    sorted_ms = sorted(milestones, key=lambda m: (m.status != "planned", m.target_date))

    if not sorted_ms:
        body = ft.Container(
            ft.Column(
                [
                    ft.Icon(ft.Icons.FLAG_OUTLINED, size=64, color=ft.Colors.ON_SURFACE_VARIANT),
                    ft.Text("Noch keine Meilensteine", size=16, color=ft.Colors.ON_SURFACE_VARIANT),
                    ft.Text("Füge Ziele und Meilensteine hinzu.", size=13, color=ft.Colors.ON_SURFACE_VARIANT),
                ],
                horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                alignment=ft.MainAxisAlignment.CENTER,
            ),
            expand=True,
            alignment=ft.Alignment(0, 0),
        )
    else:
        body = ft.ListView(
            controls=[_milestone_card(ms, state, store, page) for ms in sorted_ms],
            expand=True,
            padding=16,
            spacing=4,
        )

    return ft.Stack(
        [
            body,
            ft.FloatingActionButton(
                icon=ft.Icons.ADD,
                on_click=on_add,
                tooltip="Neuer Meilenstein",
            ),
        ],
        expand=True,
    )
