from datetime import datetime

import flet as ft

from src.store.store import Store
from src.store.actions import StartStopwatch, PauseStopwatch, ResumeStopwatch, StopStopwatch, RemoveSession
from src.types.app_state import AppState
from src.logic.stopwatch import elapsed_seconds, format_seconds

# Geteilte Referenz auf das aktive Timer-Text-Control (wird von app_view.py aktualisiert)
_timer_ref: dict = {"text": None}


def _build_goal_selector(state: AppState, store: Store) -> ft.Dropdown:
    sw = state.stopwatch
    active_goals = [g for g in state.goals if g.status == "active"]
    goal_options = [
        ft.dropdown.Option(key=str(g.id), text=g.title) for g in active_goals
    ]
    selected_goal_id = str(sw.goal_id) if sw.goal_id else (str(active_goals[0].id) if active_goals else None)

    return ft.Dropdown(
        label="Lernziel",
        options=goal_options,
        value=selected_goal_id,
        disabled=sw.phase == "running",
        width=350,
    )


def _build_history_section(state: AppState, store: Store) -> ft.Column:
    recent_sessions = sorted(state.sessions, key=lambda s: s.ended_at, reverse=True)[:5]

    def _session_row(s) -> ft.Control:
        goal = next((g for g in state.goals if g.id == s.goal_id), None)
        goal_title = goal.title if goal else "Unbekannt"

        def on_delete(e, sid=s.id):
            store.dispatch(RemoveSession(session_id=sid))

        return ft.ListTile(
            leading=ft.Icon(ft.Icons.HISTORY),
            title=ft.Text(goal_title, size=13),
            subtitle=ft.Text(s.started_at.strftime("%d.%m. %H:%M"), size=11),
            trailing=ft.Row(
                [
                    ft.Text(format_seconds(s.duration_seconds), weight=ft.FontWeight.BOLD),
                    ft.IconButton(
                        icon=ft.Icons.DELETE_OUTLINE,
                        icon_color=ft.Colors.ERROR,
                        icon_size=18,
                        tooltip="Session löschen",
                        on_click=on_delete,
                    ),
                ],
                tight=True,
                spacing=0,
            ),
        )

    if recent_sessions:
        return ft.Column([
            ft.Divider(),
            ft.Text("Letzte Sessions", size=14, weight=ft.FontWeight.BOLD),
            *[_session_row(s) for s in recent_sessions]
        ])
    return ft.Column([
        ft.Divider(),
        ft.Text("Noch keine Sessions", color=ft.Colors.ON_SURFACE_VARIANT, size=13),
    ])


def _build_timer_display(state: AppState) -> tuple[ft.Text, ft.Text]:
    sw = state.stopwatch
    initial_secs = elapsed_seconds(sw, datetime.now())
    timer_text = ft.Text(
        format_seconds(initial_secs),
        size=80,
        font_family="monospace",
        weight=ft.FontWeight.BOLD,
        color=ft.Colors.PRIMARY,
    )

    phase_label = ft.Text(
        {"idle": "", "running": "Läuft...", "paused": "Pausiert", "finished": "Fertig"}[sw.phase],
        size=14,
        color=ft.Colors.ON_SURFACE_VARIANT,
        italic=True,
    )
    return timer_text, phase_label


def _build_controls(state: AppState, store: Store, goal_dropdown: ft.Dropdown, page: ft.Page) -> tuple[ft.Row, ft.TextField]:
    sw = state.stopwatch

    note_field = ft.TextField(
        label="Notiz zur Session (optional)",
        multiline=True,
        max_lines=2,
        width=350,
        visible=False,
    )

    def on_start(e):
        if not goal_dropdown.value:
            return
        from uuid import UUID
        store.dispatch(StartStopwatch(goal_id=UUID(goal_dropdown.value), now=datetime.now()))

    def on_pause(e):
        store.dispatch(PauseStopwatch(now=datetime.now()))

    def on_resume(e):
        store.dispatch(ResumeStopwatch(now=datetime.now()))

    def on_stop(e):
        note_field.visible = True
        note_field.update()
        stop_btn.visible = False
        stop_btn.update()
        confirm_btn.visible = True
        confirm_btn.update()

    def on_confirm_stop(e):
        store.dispatch(StopStopwatch(
            now=datetime.now(),
            note=note_field.value or "",
        ))
        note_field.visible = False
        note_field.value = ""

    # Buttons je nach Phase
    start_btn = ft.ElevatedButton(
        "Start", icon=ft.Icons.PLAY_ARROW,
        on_click=on_start,
        visible=sw.phase == "idle",
        style=ft.ButtonStyle(bgcolor=ft.Colors.GREEN, color=ft.Colors.WHITE),
    )
    pause_btn = ft.ElevatedButton(
        "Pause", icon=ft.Icons.PAUSE,
        on_click=on_pause,
        visible=sw.phase == "running",
    )
    resume_btn = ft.ElevatedButton(
        "Weiter", icon=ft.Icons.PLAY_ARROW,
        on_click=on_resume,
        visible=sw.phase == "paused",
        style=ft.ButtonStyle(bgcolor=ft.Colors.GREEN, color=ft.Colors.WHITE),
    )
    stop_btn = ft.OutlinedButton(
        "Stop & Speichern", icon=ft.Icons.STOP,
        on_click=on_stop,
        visible=sw.phase in ("running", "paused"),
        style=ft.ButtonStyle(color=ft.Colors.RED),
    )
    confirm_btn = ft.ElevatedButton(
        "Session abschließen", icon=ft.Icons.SAVE,
        on_click=on_confirm_stop,
        visible=False,
        style=ft.ButtonStyle(bgcolor=ft.Colors.BLUE, color=ft.Colors.WHITE),
    )

    controls_row = ft.Row(
        [start_btn, pause_btn, resume_btn, stop_btn, confirm_btn],
        alignment=ft.MainAxisAlignment.CENTER,
        spacing=8,
    )

    return controls_row, note_field


def build_stopwatch_view(state: AppState, store: Store, page: ft.Page) -> ft.Control:
    """Stoppuhr-Ansicht mit Echtzeit-Anzeige."""

    goal_dropdown = _build_goal_selector(state, store)
    timer_text, phase_label = _build_timer_display(state)
    controls_row, note_field = _build_controls(state, store, goal_dropdown, page)
    history_section = _build_history_section(state, store)

    _timer_ref["text"] = timer_text

    return ft.Column(
        [
            ft.Container(
                ft.Column(
                    [
                        goal_dropdown,
                        ft.Container(height=8),
                        timer_text,
                        phase_label,
                        controls_row,
                        note_field,
                    ],
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                    spacing=8,
                ),
                padding=24,
                alignment=ft.Alignment(0, 0),
            ),
            history_section,
        ],
        expand=True,
        scroll=ft.ScrollMode.AUTO,
    )
