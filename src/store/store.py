"""
Store: einzige nicht-pure Klasse der Anwendung.
Kapselt alle Seiteneffekte: Persistenz + Observer-Benachrichtigung.
"""
from typing import Callable

from src.types.app_state import AppState
from src.store.actions import Action
from src.store.reducer import reduce
from src.persistence.file_store import load_state, save_state


class Store:
    def __init__(self):
        self._state: AppState = load_state()
        self._listeners: list[Callable[[AppState], None]] = []

    @property
    def state(self) -> AppState:
        return self._state

    def dispatch(self, action: Action) -> None:
        """Führt eine Action aus, persistiert den neuen State und benachrichtigt Observer."""
        new_state = reduce(self._state, action)
        if new_state is not self._state:
            self._state = new_state
            save_state(new_state)
            for listener in self._listeners:
                listener(new_state)

    def subscribe(self, listener: Callable[[AppState], None]) -> Callable[[], None]:
        """Registriert einen Observer. Gibt Unsubscribe-Funktion zurück."""
        self._listeners.append(listener)
        return lambda: self._listeners.remove(listener)
