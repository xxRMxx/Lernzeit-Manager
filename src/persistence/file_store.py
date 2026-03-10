"""
Einzige IO-Seite der Anwendung für Persistenz.
Alle anderen Module sind frei von File-IO.
"""
import json
from pathlib import Path

from src.types.app_state import AppState
from src.persistence.serializer import state_to_dict, state_from_dict

DATA_FILE = Path("data/state.json")


def load_state() -> AppState:
    """Lädt State aus JSON. Gibt leeren AppState bei fehlender/korrupter Datei."""
    if not DATA_FILE.exists():
        return AppState()
    try:
        with DATA_FILE.open("r", encoding="utf-8") as f:
            return state_from_dict(json.load(f))
    except (json.JSONDecodeError, KeyError, ValueError):
        # Korrupte Datei: mit leerem State starten, Backup anlegen
        _backup_corrupt_file()
        return AppState()


def save_state(state: AppState) -> None:
    """Persistiert State als JSON (atomisches Schreiben via Temp-Datei)."""
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    tmp_file = DATA_FILE.with_suffix(".tmp")
    try:
        with tmp_file.open("w", encoding="utf-8") as f:
            json.dump(state_to_dict(state), f, indent=2, ensure_ascii=False)
        tmp_file.replace(DATA_FILE)
    except OSError:
        if tmp_file.exists():
            tmp_file.unlink()
        raise


def _backup_corrupt_file() -> None:
    if DATA_FILE.exists():
        backup = DATA_FILE.with_suffix(".corrupt.json")
        DATA_FILE.rename(backup)
