"""
Einzige IO-Seite der Anwendung für Persistenz.
Alle anderen Module sind frei von File-IO.
"""
import json
from pathlib import Path

from src.types.app_state import AppState
from src.persistence.serializer import state_to_dict, state_from_dict

_base_dir: Path | None = None


def set_base_dir(path: Path) -> None:
    """Setzt das Basisverzeichnis für die Datenpersistenz (z.B. app_data_dir auf Android)."""
    global _base_dir
    _base_dir = path


def _data_file() -> Path:
    base = _base_dir if _base_dir is not None else Path(".")
    return base / "data" / "state.json"


def load_state() -> AppState:
    """Lädt State aus JSON. Gibt leeren AppState bei fehlender/korrupter Datei."""
    data_file = _data_file()
    if not data_file.exists():
        return AppState()
    try:
        with data_file.open("r", encoding="utf-8") as f:
            return state_from_dict(json.load(f))
    except (json.JSONDecodeError, KeyError, ValueError):
        # Korrupte Datei: mit leerem State starten, Backup anlegen
        _backup_corrupt_file()
        return AppState()


def save_state(state: AppState) -> None:
    """Persistiert State als JSON (atomisches Schreiben via Temp-Datei)."""
    data_file = _data_file()
    data_file.parent.mkdir(parents=True, exist_ok=True)
    tmp_file = data_file.with_suffix(".tmp")
    try:
        with tmp_file.open("w", encoding="utf-8") as f:
            json.dump(state_to_dict(state), f, indent=2, ensure_ascii=False)
        tmp_file.replace(data_file)
    except OSError:
        if tmp_file.exists():
            tmp_file.unlink()
        raise


def _backup_corrupt_file() -> None:
    data_file = _data_file()
    if data_file.exists():
        backup = data_file.with_suffix(".corrupt.json")
        data_file.rename(backup)
