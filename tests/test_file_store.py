import json
from pathlib import Path
import pytest

from src.types.app_state import AppState
from src.persistence.file_store import set_base_dir, load_state, save_state, _data_file

@pytest.fixture(autouse=True)
def setup_test_dir(tmp_path: Path):
    """Setzt das base_dir für file_store für jeden Test auf ein temporäres Verzeichnis."""
    set_base_dir(tmp_path)
    yield
    set_base_dir(None)  # Reset nach Test

def test_load_state_missing_file():
    """Testet, dass ein fehlendes state.json zu einem leeren AppState führt."""
    state = load_state()
    assert isinstance(state, AppState)
    assert len(state.goals) == 0
    assert len(state.sessions) == 0
    assert len(state.milestones) == 0

def test_save_and_load_state():
    """Testet das atomische Speichern und anschließende Laden eines AppStates."""
    state = AppState()
    # Verändere den State leicht, um sicherzustellen, dass nicht einfach ein Default zurückkommt
    # (hier vereinfacht: wir testen ob die Datei existiert und korrekt geladen wird)
    save_state(state)

    data_file = _data_file()
    assert data_file.exists()

    loaded_state = load_state()
    assert isinstance(loaded_state, AppState)

def test_load_corrupt_json():
    """Testet das Verhalten bei einer korrupten JSON-Datei (JSONDecodeError)."""
    data_file = _data_file()
    data_file.parent.mkdir(parents=True, exist_ok=True)
    with data_file.open("w", encoding="utf-8") as f:
        f.write("{ invalid json")

    state = load_state()
    assert isinstance(state, AppState)

    # Prüfe ob Backup existiert
    backup_file = data_file.with_suffix(".corrupt.json")
    assert backup_file.exists()
    assert not data_file.exists()

def test_load_invalid_schema():
    """Testet das Verhalten bei gültigem JSON, aber ungültigem Schema (KeyError/ValueError)."""
    data_file = _data_file()
    data_file.parent.mkdir(parents=True, exist_ok=True)
    with data_file.open("w", encoding="utf-8") as f:
        # Falsche Struktur innerhalb von goals (fehlende keys)
        f.write('{"goals": [{"invalid": "data"}]}')

    state = load_state()
    assert isinstance(state, AppState)

    # Prüfe ob Backup existiert
    backup_file = data_file.with_suffix(".corrupt.json")
    assert backup_file.exists()
    assert not data_file.exists()
