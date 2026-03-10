import os
import flet as ft

from src.store.store import Store
from src.views.app_view import build_app


def main(page: ft.Page) -> None:
    store = Store()
    build_app(page, store)


if __name__ == "__main__":
    port = int(os.environ.get("FLET_PORT", 8550))
    ft.run(main, view=ft.AppView.WEB_BROWSER, port=port)
