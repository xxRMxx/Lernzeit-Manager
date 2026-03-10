import asyncio
from datetime import datetime

import flet as ft

from src.store.store import Store
from src.store.actions import SetActiveView
from src.types.app_state import AppState
from src.logic.reminder import get_reminders

from src.views.dashboard.dashboard_view import build_dashboard_view
from src.views.goals.goals_view import build_goals_view
from src.views.planning.planning_view import build_planning_view
from src.views.stopwatch.stopwatch_view import build_stopwatch_view
from src.views.milestones.milestones_view import build_milestones_view

_VIEWS = {
    "dashboard": build_dashboard_view,
    "goals": build_goals_view,
    "planning": build_planning_view,
    "stopwatch": build_stopwatch_view,
    "milestones": build_milestones_view,
}

_NAV_ITEMS = [
    ft.NavigationBarDestination(icon=ft.Icons.DASHBOARD_OUTLINED, selected_icon=ft.Icons.DASHBOARD, label="Übersicht"),
    ft.NavigationBarDestination(icon=ft.Icons.SCHOOL_OUTLINED, selected_icon=ft.Icons.SCHOOL, label="Ziele"),
    ft.NavigationBarDestination(icon=ft.Icons.CALENDAR_MONTH_OUTLINED, selected_icon=ft.Icons.CALENDAR_MONTH, label="Planung"),
    ft.NavigationBarDestination(icon=ft.Icons.TIMER_OUTLINED, selected_icon=ft.Icons.TIMER, label="Stoppuhr"),
    ft.NavigationBarDestination(icon=ft.Icons.FLAG_OUTLINED, selected_icon=ft.Icons.FLAG, label="Meilensteine"),
]

_VIEW_ORDER = ["dashboard", "goals", "planning", "stopwatch", "milestones"]


def build_app(page: ft.Page, store: Store) -> None:
    page.title = "Lernzeit-Manager"
    page.theme_mode = ft.ThemeMode.SYSTEM
    page.padding = 0
    page.theme = ft.Theme(color_scheme_seed=ft.Colors.INDIGO)

    content_area = ft.Column(expand=True)

    def get_selected_index(view_name: str) -> int:
        try:
            return _VIEW_ORDER.index(view_name)
        except ValueError:
            return 0

    def render(state: AppState) -> None:
        view_fn = _VIEWS.get(state.active_view, build_dashboard_view)
        nav_bar.selected_index = get_selected_index(state.active_view)
        content_area.controls = [
            ft.Container(
                content=view_fn(state, store, page),
                expand=True,
                padding=ft.padding.only(left=16, right=16, top=8, bottom=8),
            )
        ]
        page.update()

    def on_nav_change(e):
        view_name = _VIEW_ORDER[e.control.selected_index]
        store.dispatch(SetActiveView(view_name=view_name))

    nav_bar = ft.NavigationBar(
        destinations=_NAV_ITEMS,
        on_change=on_nav_change,
        selected_index=get_selected_index(store.state.active_view),
    )

    page.add(
        ft.Column(
            [
                ft.Container(
                    ft.Text("Lernzeit-Manager", size=20, weight=ft.FontWeight.BOLD, color=ft.Colors.WHITE),
                    bgcolor=ft.Colors.INDIGO,
                    padding=ft.padding.symmetric(horizontal=16, vertical=12),
                ),
                content_area,
                nav_bar,
            ],
            expand=True,
            spacing=0,
        )
    )

    store.subscribe(render)
    render(store.state)

    # Background-Task für Erinnerungen
    async def reminder_loop():
        while True:
            await asyncio.sleep(3600)
            reminders = get_reminders(store.state, datetime.now())
            if reminders:
                snack = ft.SnackBar(
                    content=ft.Text(reminders[0]),
                    action="Zur Übersicht",
                    duration=8000,
                    open=True,
                )
                page.overlay.append(snack)
                page.update()

    page.run_task(reminder_loop)
