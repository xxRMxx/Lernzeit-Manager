import threading
import time

def background_task():
    print("Background task started")
    time.sleep(1)
    print("Background task finished")

t = threading.Thread(target=background_task)
t.start()
print("Main thread continues")
t.join()
