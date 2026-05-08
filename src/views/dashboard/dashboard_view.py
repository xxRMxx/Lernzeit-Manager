from datetime import date

import flet as ft

from src.store.store import Store
from src.types.app_state import AppState
from src.logic.statistics import total_hours_all_goals, streak_days, milestones_by_status, sessions_by_week
from src.logic.reminder import get_reminders
from src.logic.stopwatch import format_seconds
from src.views.components.stat_card import stat_card
from src.views.components.progress_bar import labeled_progress_bar


def _reminders_section(state: AppState) -> ft.Control:
    from datetime import datetime
    reminders = get_reminders(state, datetime.now())
    if not reminders:
        return ft.Container()
    return ft.Column([
        ft.Container(
            ft.Row([
                ft.Icon(ft.Icons.NOTIFICATIONS_ACTIVE, color=ft.Colors.ORANGE),
                ft.Column([ft.Text(r, size=13) for r in reminders], spacing=2, expand=True),
            ], spacing=12),
            bgcolor=ft.Colors.ORANGE_50,
            border=ft.border.all(1, ft.Colors.ORANGE),
            border_radius=8,
            padding=12,
        )
    ])


def _goals_progress_section(state: AppState) -> ft.Control:
    active_goals = [g for g in state.goals if g.status == "active"]
    if not active_goals:
        return ft.Container()

    # Vorberechnung der Stunden pro Ziel für O(N) statt O(N*G)
    hours_map: dict[str, float] = {}
    for s in state.sessions:
        gid_str = str(s.goal_id)
        hours_map[gid_str] = hours_map.get(gid_str, 0.0) + s.duration_seconds / 3600

    bars = []
    for g in active_goals:
        studied = hours_map.get(str(g.id), 0.0)
        ratio = min(studied / g.target_hours, 1.0) if g.target_hours > 0 else 0.0
        bars.append(
            labeled_progress_bar(
                g.title,
                ratio,
                f"{studied:.1f}h / {g.target_hours:.0f}h",
            )
        )
    
    return ft.Card(
        content=ft.Container(
            ft.Column([
                ft.Text("Aktive Lernziele", size=14, weight=ft.FontWeight.BOLD),
                *bars,
            ], spacing=10),
            padding=16,
        ),
    )


def _recent_activity(state: AppState) -> ft.Control:
    recent = sorted(state.sessions, key=lambda s: s.ended_at, reverse=True)[:5]
    if not recent:
        return ft.Container()

    def session_row(s):
        goal = next((g for g in state.goals if g.id == s.goal_id), None)
        return ft.ListTile(
            leading=ft.Icon(ft.Icons.ACCESS_TIME),
            title=ft.Text(goal.title if goal else "Unbekannt", size=13),
            subtitle=ft.Text(s.started_at.strftime("%d.%m. %H:%M"), size=11),
            trailing=ft.Text(format_seconds(s.duration_seconds), weight=ft.FontWeight.BOLD, size=13),
            min_vertical_padding=4,
        )

    return ft.Card(
        content=ft.Container(
            ft.Column([
                ft.Text("Letzte Lerneinheiten", size=14, weight=ft.FontWeight.BOLD),
                *[session_row(s) for s in recent],
            ], spacing=4),
            padding=16,
        ),
    )


def _weekly_chart(state: AppState) -> ft.Control:
    """Einfaches Balkendiagramm der letzten 8 Wochen als Text-Visualisierung."""
    from datetime import datetime
    weeks = sessions_by_week(state.sessions, datetime.now().year)
    if not weeks:
        return ft.Container()

    current_week = datetime.now().isocalendar()[1]
    show_weeks = sorted([w for w in weeks if w <= current_week])[-8:]
    max_h = max((weeks[w] for w in show_weeks), default=1)

    bars = []
    for w in show_weeks:
        h = weeks.get(w, 0.0)
        bars.append(ft.Column([
            ft.Text(f"{h:.1f}h", size=10, text_align=ft.TextAlign.CENTER),
            ft.Container(
                bgcolor=ft.Colors.PRIMARY,
                width=30,
                height=max(4, (h / max(max_h, 0.1)) * 80),
                border_radius=ft.border_radius.vertical(top=4, bottom=0),
            ),
            ft.Text(f"KW{w}", size=10, color=ft.Colors.ON_SURFACE_VARIANT),
        ], horizontal_alignment=ft.CrossAxisAlignment.CENTER, spacing=2))

    return ft.Card(
        content=ft.Container(
            ft.Column([
                ft.Text("Lernzeit pro Woche (letzte 8 Wochen)", size=14, weight=ft.FontWeight.BOLD),
                ft.Row(
                    bars,
                    alignment=ft.MainAxisAlignment.START,
                    vertical_alignment=ft.CrossAxisAlignment.END,
                    spacing=8,
                ),
            ], spacing=12),
            padding=16,
        ),
    )


def build_dashboard_view(state: AppState, store: Store, page: ft.Page) -> ft.Control:
    today = date.today()
    total_h = total_hours_all_goals(state.sessions)
    streak = streak_days(state.sessions, today)
    ms_status = milestones_by_status(state.milestones)
    active_goals_count = sum(1 for g in state.goals if g.status == "active")
    completed_goals_count = sum(1 for g in state.goals if g.status == "completed")

    stats_row = ft.Row(
        [
            stat_card("Gesamte Lernzeit", f"{total_h:.1f}h", icon=ft.Icons.ACCESS_TIME),
            stat_card("Lern-Streak", f"{streak} Tage", icon=ft.Icons.LOCAL_FIRE_DEPARTMENT),
            stat_card("Aktive Ziele", str(active_goals_count), icon=ft.Icons.SCHOOL),
            stat_card("Ziele erreicht", str(completed_goals_count), icon=ft.Icons.CHECK_CIRCLE),
            stat_card("Meilensteine", str(ms_status.get("achieved", 0)), f"von {sum(ms_status.values())}", icon=ft.Icons.FLAG),
        ],
        wrap=True,
        spacing=8,
        run_spacing=8,
    )

    return ft.Column(
        [
            _reminders_section(state),
            stats_row,
            _goals_progress_section(state),
            _weekly_chart(state),
            _recent_activity(state),
        ],
        spacing=16,
        scroll=ft.ScrollMode.AUTO,
        expand=True,
    )
