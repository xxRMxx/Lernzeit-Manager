from datetime import date
from uuid import UUID
import logging

import flet as ft

logger = logging.getLogger(__name__)

from src.store.store import Store
from src.store.actions import SetRoughPlanEntry, AddTimeSlot, RemoveTimeSlot
from src.types.app_state import AppState
from src.types.plan import RoughPlanEntry, TimeSlot

_MONTH_NAMES = [
    "", "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
    "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
]


def _build_rough_plan(state: AppState, store: Store, page: ft.Page) -> ft.Control:
    """6-Monats-Grobplanung: Grid mit Stunden-Eingabe pro Ziel und Monat."""
    today = date.today()
    months = [(today.year + (today.month + i - 1) // 12,
               (today.month + i - 1) % 12 + 1) for i in range(6)]

    active_goals = [g for g in state.goals if g.status == "active"]

    if not active_goals:
        return ft.Container(
            ft.Column([
                ft.Icon(ft.Icons.CALENDAR_MONTH_OUTLINED, size=48, color=ft.Colors.ON_SURFACE_VARIANT),
                ft.Text("Erstelle zuerst ein aktives Lernziel.", color=ft.Colors.ON_SURFACE_VARIANT),
            ], horizontal_alignment=ft.CrossAxisAlignment.CENTER),
            alignment=ft.Alignment(0, 0),
            expand=True,
        )

    def get_planned(goal_id: UUID, year: int, month: int) -> float:
        entry = next(
            (p for p in state.rough_plans if p.goal_id == goal_id and p.year == year and p.month == month),
            None,
        )
        return entry.planned_hours if entry else 0.0

    def make_cell(goal_id: UUID, year: int, month: int) -> ft.Control:
        current_val = get_planned(goal_id, year, month)
        tf = ft.TextField(
            value=str(int(current_val)) if current_val > 0 else "",
            hint_text="0",
            width=60,
            height=40,
            text_align=ft.TextAlign.CENTER,
            keyboard_type=ft.KeyboardType.NUMBER,
            border_radius=6,
            content_padding=ft.padding.symmetric(horizontal=4, vertical=4),
        )

        def on_blur(e, gid=goal_id, y=year, m=month, field=tf):
            try:
                field.error_text = None
                field.update()
                hours = float(field.value or "0")
                if hours >= 0:
                    store.dispatch(SetRoughPlanEntry(
                        entry=RoughPlanEntry(goal_id=gid, year=y, month=m, planned_hours=hours)
                    ))
            except ValueError:
                logger.error("Ungültige Eingabe im Planungsfeld", exc_info=True)
                field.error_text = "Ungültig"
                field.update()

        tf.on_blur = on_blur
        return tf

    # Header-Zeile: Monatsnamen
    header_cells = [ft.Container(width=150)] + [
        ft.Container(
            ft.Text(f"{_MONTH_NAMES[m]}\n{str(y)[-2:]}", text_align=ft.TextAlign.CENTER, size=12, weight=ft.FontWeight.BOLD),
            width=70, alignment=ft.Alignment(0, 0),
        )
        for y, m in months
    ]

    rows = [ft.Row(header_cells, spacing=4)]
    for goal in active_goals:
        cells = [
            ft.Container(
                ft.Text(goal.title, size=12, no_wrap=True, overflow=ft.TextOverflow.ELLIPSIS),
                width=150,
            )
        ] + [make_cell(goal.id, y, m) for y, m in months]
        rows.append(ft.Row(cells, spacing=4))

    total_row = [ft.Container(ft.Text("Gesamt (h)", size=12, weight=ft.FontWeight.BOLD), width=150)]
    for y, m in months:
        total = sum(get_planned(g.id, y, m) for g in active_goals)
        total_row.append(
            ft.Container(
                ft.Text(f"{int(total)}", text_align=ft.TextAlign.CENTER, size=12, weight=ft.FontWeight.BOLD),
                width=70, alignment=ft.Alignment(0, 0),
            )
        )
    rows.append(ft.Divider())
    rows.append(ft.Row(total_row, spacing=4))

    return ft.Container(
        ft.Column([
            ft.Text("6-Monats-Grobplanung", size=16, weight=ft.FontWeight.BOLD),
            ft.Text("Trage die geplanten Lernstunden pro Monat und Ziel ein.", size=12, color=ft.Colors.ON_SURFACE_VARIANT),
            ft.Container(height=8),
            ft.Row(
                controls=[ft.Column(rows, spacing=8)],
                scroll=ft.ScrollMode.AUTO,
            ),
        ]),
        padding=16,
        expand=True,
    )


def _build_month_plan(state: AppState, store: Store, page: ft.Page) -> ft.Control:
    """1-Monats-Detailplanung: Liste der Tage mit Zeitfenstern."""
    today = date.today()
    selected_month = {"year": today.year, "month": today.month}

    active_goals = [g for g in state.goals if g.status == "active"]

    def on_prev(e):
        m = selected_month["month"] - 1
        y = selected_month["year"]
        if m < 1:
            m = 12
            y -= 1
        selected_month["month"] = m
        selected_month["year"] = y
        refresh()

    def on_next(e):
        m = selected_month["month"] + 1
        y = selected_month["year"]
        if m > 12:
            m = 1
            y += 1
        selected_month["month"] = m
        selected_month["year"] = y
        refresh()

    content_col = ft.Column([], spacing=8, scroll=ft.ScrollMode.AUTO, expand=True)
    month_label = ft.Text("", size=16, weight=ft.FontWeight.BOLD)

    def _do_update():
        """Aktualisiert nur wenn der Control bereits zur Page gehört."""
        try:
            content_col.update()
            month_label.update()
        except RuntimeError:
            pass  # Noch nicht zur Page hinzugefügt – kein Update nötig

    def refresh():
        y = selected_month["year"]
        m = selected_month["month"]
        month_label.value = f"{_MONTH_NAMES[m]} {y}"

        import calendar
        _, days_in_month = calendar.monthrange(y, m)

        if not active_goals:
            content_col.controls = [ft.Text("Kein aktives Lernziel vorhanden.", color=ft.Colors.ON_SURFACE_VARIANT)]
            _do_update()
            return

        # Precompute plans to avoid O(N*M) lookups inside the day loop
        goal_plans = {p.goal_id: p for p in state.month_plans if p.year == y and p.month == m}

        # Precompute slots by date
        slots_by_date = {}
        for goal in active_goals:
            plan = goal_plans.get(goal.id)
            if plan:
                for slot in plan.slots:
                    slots_by_date.setdefault(slot.date, []).append((goal, slot))

        rows = []
        for day in range(1, days_in_month + 1):
            d = date(y, m, day)
            weekday = d.strftime("%a")
            is_weekend = d.weekday() >= 5

            # Slots aller Ziele für diesen Tag sammeln
            day_slots = slots_by_date.get(d, [])

            def make_add_btn(day_date=d):
                def on_add(e):
                    _open_slot_form(day_date, active_goals, store, page)
                return ft.IconButton(ft.Icons.ADD_CIRCLE_OUTLINE, on_click=on_add, icon_size=18)

            slot_chips = [
                ft.Chip(
                    label=ft.Text(f"{g.title[:15]}: {s.planned_minutes}min", size=11),
                    bgcolor=ft.Colors.PRIMARY_CONTAINER,
                    delete_icon=ft.Icon(ft.Icons.CLOSE, size=14),
                    on_delete=lambda e, gid=g.id, sd=d: store.dispatch(
                        RemoveTimeSlot(goal_id=gid, year=y, month=m, slot_date=sd)
                    ),
                )
                for g, s in day_slots
            ]

            rows.append(ft.Row([
                ft.Container(
                    ft.Text(
                        f"{day:2d} {weekday}",
                        size=13,
                        color=ft.Colors.ON_SURFACE_VARIANT if is_weekend else None,
                        weight=ft.FontWeight.BOLD if d == today else None,
                    ),
                    width=65,
                ),
                ft.Row(slot_chips + [make_add_btn()], spacing=4, wrap=True, expand=True),
            ], spacing=8))

        content_col.controls = rows
        _do_update()

    def _open_slot_form(day: date, goals, store, page):
        goal_dd = ft.Dropdown(
            label="Lernziel",
            options=[ft.dropdown.Option(key=str(g.id), text=g.title) for g in goals],
            value=str(goals[0].id),
            width=300,
        )
        minutes_field = ft.TextField(label="Geplante Minuten", value="60", keyboard_type=ft.KeyboardType.NUMBER, width=300)
        note_field = ft.TextField(label="Notiz (optional)", width=300)

        def on_save(e):
            try:
                minutes_field.error_text = None
                minutes_field.update()
                mins = int(minutes_field.value or "0")
                if mins <= 0:
                    return
                from uuid import UUID
                gid = UUID(goal_dd.value)
                slot = TimeSlot(date=day, planned_minutes=mins, note=note_field.value or "")
                store.dispatch(AddTimeSlot(goal_id=gid, year=day.year, month=day.month, slot=slot))
                page.pop_dialog()
                refresh()
            except (ValueError, AttributeError):
                logger.error("Ungültige Eingabe beim Speichern des Zeitslots", exc_info=True)
                minutes_field.error_text = "Ungültig"
                minutes_field.update()

        form_dlg = ft.AlertDialog(
            title=ft.Text(f"Lerneinheit: {day.strftime('%d.%m.%Y')}"),
            content=ft.Column([goal_dd, minutes_field, note_field], width=320, tight=True, spacing=8),
            actions=[
                ft.TextButton("Abbrechen", on_click=lambda e: page.pop_dialog()),
                ft.ElevatedButton("Speichern", on_click=on_save),
            ],
        )
        page.show_dialog(form_dlg)

    refresh()

    return ft.Column([
        ft.Row([
            ft.IconButton(ft.Icons.CHEVRON_LEFT, on_click=on_prev),
            month_label,
            ft.IconButton(ft.Icons.CHEVRON_RIGHT, on_click=on_next),
        ], alignment=ft.MainAxisAlignment.CENTER),
        ft.Divider(),
        content_col,
    ], expand=True)


def build_planning_view(state: AppState, store: Store, page: ft.Page) -> ft.Control:
    return ft.Tabs(
        length=2,
        content=ft.Column(
            [
                ft.TabBar(
                    tabs=[
                        ft.Tab(label="6-Monats-Übersicht", icon=ft.Icons.CALENDAR_VIEW_MONTH),
                        ft.Tab(label="Monats-Detail", icon=ft.Icons.CALENDAR_TODAY),
                    ],
                    scrollable=False,
                ),
                ft.TabBarView(
                    controls=[
                        _build_rough_plan(state, store, page),
                        _build_month_plan(state, store, page),
                    ],
                    expand=True,
                ),
            ],
            spacing=0,
            expand=True,
        ),
        expand=True,
    )
