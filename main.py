import os
import flet as ft

from src.persistence.file_store import set_base_dir
from src.store.store import Store
from src.views.app_view import build_app

def main(page: ft.Page) -> None:
    # Optional: Basisverzeichnis für Android setzen
    # if os.path.exists("/sdcard"):
    #     set_base_dir(Path("/sdcard/Android/data/de.lernzeit.lernzeit_manager/files"))
    
    store = Store()
    build_app(page, store)

if __name__ == "__main__":
    port = int(os.environ.get("FLET_PORT", 8550))
    ft.run(main, view=ft.AppView.WEB_BROWSER, port=port, host="127.0.0.1")
