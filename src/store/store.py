"""
Store: einzige nicht-pure Klasse der Anwendung.
Kapselt alle Seiteneffekte: Persistenz + Observer-Benachrichtigung.
Optimiert: Persistenz erfolgt asynchron in einem Hintergrund-Thread.
"""
import logging
import threading
import time
from typing import Callable, Optional

from src.types.app_state import AppState
from src.store.actions import Action
from src.store.reducer import reduce
from src.persistence.file_store import load_state, save_state

logger = logging.getLogger(__name__)

class Store:
    def __init__(self):
        self._state: AppState = load_state()
        self._listeners: list[Callable[[AppState], None]] = []
        
        # Async Persistence Worker
        self._pending_state: Optional[AppState] = None
        self._save_lock = threading.Lock()
        self._save_event = threading.Event()
        self._worker_thread = threading.Thread(target=self._persistence_worker, daemon=True)
        self._worker_thread.start()

    @property
    def state(self) -> AppState:
        return self._state

    def dispatch(self, action: Action) -> None:
        """Führt eine Action aus, plant die Persistenz und benachrichtigt Observer."""
        new_state = reduce(self._state, action)
        if new_state is not self._state:
            self._state = new_state
            
            # Neue State für den Worker vormerken
            with self._save_lock:
                self._pending_state = new_state
            self._save_event.set()
            
            for listener in self._listeners:
                listener(new_state)

    def subscribe(self, listener: Callable[[AppState], None]) -> Callable[[], None]:
        """Registriert einen Observer. Gibt Unsubscribe-Funktion zurück."""
        self._listeners.append(listener)
        return lambda: self._listeners.remove(listener)

    def _persistence_worker(self) -> None:
        """Hintergrund-Thread, der den State bei Bedarf auf Disk schreibt."""
        while True:
            self._save_event.wait()
            self._save_event.clear()
            
            state_to_save = None
            with self._save_lock:
                state_to_save = self._pending_state
                self._pending_state = None
            
            if state_to_save:
                try:
                    save_state(state_to_save)
                except Exception as e:
                    logger.error(f"Fehler bei asynchroner Speicherung: {e}")
            
            # Kurze Pause um "Spamming" bei schnellen Änderungen zu vermeiden (Debouncing)
            time.sleep(0.1)
