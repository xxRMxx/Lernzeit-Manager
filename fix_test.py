import subprocess
import time
import os
import sys
env = os.environ.copy()
env["PYTHONPATH"] = "."
env["FLET_PORT"] = "8552"
proc = subprocess.Popen([sys.executable, "main.py"], env=env)
time.sleep(5)
proc.terminate()
