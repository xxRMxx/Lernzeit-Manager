import time
import os
import shutil
from pathlib import Path
from src.store.store import Store
from src.store.actions import SetActiveView
import src.persistence.file_store as fs

def run_benchmark(iterations=1000):
    tmp_dir = Path("./benchmark_tmp_verify")
    if tmp_dir.exists():
        shutil.rmtree(tmp_dir)
    tmp_dir.mkdir()

    fs.set_base_dir(tmp_dir)

    # Store initialisieren
    store = Store()

    print(f"Running benchmark with {iterations} dispatches...")

    start_time = time.perf_counter()
    for i in range(iterations):
        store.dispatch(SetActiveView(f"view_{i}"))

    end_time = time.perf_counter()
    duration = end_time - start_time

    print(f"Total time: {duration:.4f}s")
    print(f"Time per dispatch: {(duration/iterations)*1000:.4f}ms")

    # Wait to ensure background save is done so we can verify the file was written
    time.sleep(0.5)

    data_file = tmp_dir / "data" / "state.json"
    if data_file.exists():
        print(f"Verified state.json exists with size {data_file.stat().st_size} bytes.")
    else:
        print("ERROR: state.json was not created.")

    # Cleanup
    shutil.rmtree(tmp_dir)

if __name__ == "__main__":
    run_benchmark(1000)
