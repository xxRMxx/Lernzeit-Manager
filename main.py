import os
import traceback
from pathlib import Path

import flet as ft

from src.persistence.file_store import set_base_dir
from src.store.store import Store
from src.views.app_view import build_app

_LOG_PATH = "/sdcard/Android/data/de.lernzeit.lernzeit_manager/files/lz_debug.log"


def _log(msg: str) -> None:
    print(msg)
    try:
        os.makedirs(os.path.dirname(_LOG_PATH), exist_ok=True)
        with open(_LOG_PATH, "a") as f:
            import datetime
            f.write(f"{datetime.datetime.now().isoformat()} {msg}\n")
    except Exception as e:
        print(f"[LOG_ERR] {e}")


def main(page: ft.Page) -> None:
    try:
        page.title = "Lernzeit Manager"
        page.bgcolor = ft.Colors.BACKGROUND
        page.theme_mode = ft.ThemeMode.LIGHT

        # Initiale Pfad-Konfiguration für Android
        # Auf dem Desktop bleibt es im aktuellen Verzeichnis
        assets_dir = Path(__file__).parent / "assets"

        # Store initialisieren
        store = Store()

        # UI aufbauen
        build_app(page, store)

    except Exception as e:
        _log(f"[LZ-DIAG] FEHLER: {type(e).__name__}: {e}")
        _log(traceback.format_exc())


def _copy_log_to_sdcard():
    """Kopiert console.log nach External Storage (lesbar via adb)."""
    try:
        console = os.environ.get("FLET_APP_CONSOLE", "")
        if not console:
            return
        ext = f"/sdcard/Android/data/de.lernzeit.lernzeit_manager/files/lz_console.log"
        import shutil
        os.makedirs(os.path.dirname(ext), exist_ok=True)
        shutil.copy2(console, ext)
    except Exception:
        pass


if __name__ == "__main__":
    print("[LZ] __main__ block, starte ft.run()")
    port = int(os.environ.get("FLET_PORT", 8550))
    try:
        ft.run(main, view=ft.AppView.WEB_BROWSER, port=port)
    finally:
        _copy_log_to_sdcard()
