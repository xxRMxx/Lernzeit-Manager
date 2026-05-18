import time
import threading
from pathlib import Path
import shutil
from src.types.app_state import AppState
from src.store.actions import Action, SetActiveView
from src.store.reducer import reduce
import src.persistence.file_store as fs
from src.persistence.file_store import load_state, save_state

class StoreWorker:
    def __init__(self):
        self._state: AppState = load_state()
        self._listeners = []

        self._pending_state: AppState | None = None
        self._save_event = threading.Event()
        self._save_lock = threading.Lock()

        self._save_thread = threading.Thread(target=self._save_worker, daemon=True)
        self._save_thread.start()

    @property
    def state(self) -> AppState:
        return self._state

    def _save_worker(self):
        while True:
            self._save_event.wait()
            self._save_event.clear()

            with self._save_lock:
                state_to_save = self._pending_state
                self._pending_state = None

            if state_to_save is not None:
                try:
                    save_state(state_to_save)
                except Exception as e:
                    print(f"Error saving state: {e}")

    def dispatch(self, action: Action) -> None:
        new_state = reduce(self._state, action)
        if new_state is not self._state:
            self._state = new_state

            with self._save_lock:
                self._pending_state = new_state
            self._save_event.set()

            for listener in self._listeners:
                listener(new_state)

def run_benchmark(iterations=1000):
    tmp_dir = Path("./benchmark_tmp")
    if tmp_dir.exists():
        shutil.rmtree(tmp_dir)
    tmp_dir.mkdir()
    fs.set_base_dir(tmp_dir)

    store = StoreWorker()

    start_time = time.perf_counter()
    for i in range(iterations):
        store.dispatch(SetActiveView(f"view_{i}"))

    end_time = time.perf_counter()
    duration = end_time - start_time
    print(f"Total time: {duration:.4f}s")
    print(f"Time per dispatch: {(duration/iterations)*1000:.4f}ms")

    time.sleep(0.5)
    shutil.rmtree(tmp_dir)

if __name__ == "__main__":
    run_benchmark(1000)
