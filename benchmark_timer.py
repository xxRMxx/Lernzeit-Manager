import time
import threading
from pathlib import Path
import shutil
from src.types.app_state import AppState
from src.store.actions import Action, SetActiveView
from src.store.reducer import reduce
import src.persistence.file_store as fs
from src.persistence.file_store import load_state, save_state

class StoreOptimized:
    def __init__(self):
        self._state: AppState = load_state()
        self._listeners = []
        self._save_timer = None
        self._lock = threading.Lock()

    @property
    def state(self) -> AppState:
        return self._state

    def dispatch(self, action: Action) -> None:
        new_state = reduce(self._state, action)
        if new_state is not self._state:
            self._state = new_state
            self._schedule_save(new_state)
            for listener in self._listeners:
                listener(new_state)

    def _schedule_save(self, state_to_save: AppState) -> None:
        with self._lock:
            if self._save_timer is not None:
                self._save_timer.cancel()
            self._save_timer = threading.Timer(0.1, self._perform_save, [state_to_save])
            self._save_timer.start()

    def _perform_save(self, state_to_save: AppState) -> None:
        save_state(state_to_save)

def run_benchmark(iterations=1000):
    tmp_dir = Path("./benchmark_tmp")
    if tmp_dir.exists():
        shutil.rmtree(tmp_dir)
    tmp_dir.mkdir()
    fs.set_base_dir(tmp_dir)

    store = StoreOptimized()

    start_time = time.perf_counter()
    for i in range(iterations):
        store.dispatch(SetActiveView(f"view_{i}"))

    end_time = time.perf_counter()
    duration = end_time - start_time
    print(f"Total time: {duration:.4f}s")
    print(f"Time per dispatch: {(duration/iterations)*1000:.4f}ms")

    # Wait for the last save to complete
    time.sleep(0.5)
    shutil.rmtree(tmp_dir)

if __name__ == "__main__":
    run_benchmark(1000)
