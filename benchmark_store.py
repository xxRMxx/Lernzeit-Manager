import time
import os
import shutil
from pathlib import Path
from src.store.store import Store
from src.store.actions import SetActiveView

# Wir setzen ein Temp-Verzeichnis
import src.persistence.file_store as fs

def run_benchmark(iterations=1000):
    tmp_dir = Path("./benchmark_tmp")
    if tmp_dir.exists():
        shutil.rmtree(tmp_dir)
    tmp_dir.mkdir()

    fs.set_base_dir(tmp_dir)

    # Store initialisieren (lädt leeren State, speichert nicht)
    store = Store()

    print(f"Running benchmark with {iterations} dispatches...")

    # Baseline
    start_time = time.perf_counter()
    for i in range(iterations):
        store.dispatch(SetActiveView(f"view_{i}"))

    end_time = time.perf_counter()
    duration = end_time - start_time

    print(f"Total time: {duration:.4f}s")
    print(f"Time per dispatch: {(duration/iterations)*1000:.4f}ms")

    # Cleanup
    shutil.rmtree(tmp_dir)

if __name__ == "__main__":
    run_benchmark(1000)
