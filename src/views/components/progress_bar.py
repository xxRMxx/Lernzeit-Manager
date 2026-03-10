import flet as ft


def labeled_progress_bar(
    label: str,
    value: float,
    suffix: str = "",
    color: str | None = None,
) -> ft.Control:
    """Fortschrittsbalken mit Beschriftung (0.0 - 1.0)."""
    pct = int(value * 100)
    return ft.Column(
        [
            ft.Row(
                [
                    ft.Text(label, expand=True, size=13),
                    ft.Text(f"{pct}%{' ' + suffix if suffix else ''}", size=13, weight=ft.FontWeight.BOLD),
                ]
            ),
            ft.ProgressBar(
                value=value,
                color=color or ft.Colors.PRIMARY,
                bgcolor=ft.Colors.SURFACE_CONTAINER_HIGH,
                height=8,
                border_radius=4,
            ),
        ],
        spacing=4,
    )
