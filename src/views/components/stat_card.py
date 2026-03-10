import flet as ft


def stat_card(title: str, value: str, subtitle: str = "", icon: str = "") -> ft.Control:
    """Wiederverwendbare Statistik-Kachel."""
    content_items = []

    if icon:
        content_items.append(ft.Icon(icon, size=28, color=ft.Colors.PRIMARY))

    content_items.append(
        ft.Text(value, size=28, weight=ft.FontWeight.BOLD, color=ft.Colors.PRIMARY)
    )
    content_items.append(ft.Text(title, size=13, color=ft.Colors.ON_SURFACE_VARIANT))

    if subtitle:
        content_items.append(ft.Text(subtitle, size=11, color=ft.Colors.ON_SURFACE_VARIANT))

    return ft.Card(
        content=ft.Container(
            content=ft.Column(content_items, horizontal_alignment=ft.CrossAxisAlignment.CENTER),
            padding=16,
            width=160,
        ),
        elevation=2,
    )
