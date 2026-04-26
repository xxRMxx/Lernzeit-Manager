"""
Pytest-Fixtures für den E2E-Test der Lernzeit-Manager Flet-App.
"""
import sys
import os
import shutil
import subprocess
import time
import socket
import pytest
from pathlib import Path
from playwright.sync_api import sync_playwright, Page

APP_PORT = 8552  # separater Port damit kein Konflikt mit laufender Dev-App
APP_URL = f"http://localhost:{APP_PORT}"
ROOT_DIR = Path(__file__).parent.parent
STARTUP_TIMEOUT = 15


def _port_is_open(port: int) -> bool:
    try:
        with socket.create_connection(("localhost", port), timeout=1):
            return True
    except OSError:
        return False


def _wait_for_port(port: int, timeout: int = STARTUP_TIMEOUT) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if _port_is_open(port):
            return True
        time.sleep(0.5)
    return False


@pytest.fixture(scope="session", autouse=True)
def clean_state():
    """
    Sichert state.json vor dem Test-Lauf und stellt ihn danach wieder her.
    Tests starten immer mit leerem State.
    """
    state_file = ROOT_DIR / "data" / "state.json"
    backup = ROOT_DIR / "data" / "state.test-backup.json"

    if state_file.exists():
        shutil.copy(state_file, backup)
        state_file.unlink()

    yield

    # Originalzustand wiederherstellen
    if backup.exists():
        shutil.move(str(backup), str(state_file))
    elif state_file.exists():
        state_file.unlink()


@pytest.fixture(scope="session")
def app_process(clean_state):
    """Startet die Flet-App einmalig für die gesamte Test-Session."""
    if _port_is_open(APP_PORT):
        yield None
        return

    proc = subprocess.Popen(
        [sys.executable, "main.py"],
        cwd=ROOT_DIR,
        env={**os.environ, "FLET_PORT": str(APP_PORT)},
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    if not _wait_for_port(APP_PORT):
        proc.terminate()
        pytest.fail(f"App hat nicht innerhalb von {STARTUP_TIMEOUT}s auf Port {APP_PORT} gestartet.")

    yield proc

    proc.terminate()
    proc.wait(timeout=5)


@pytest.fixture(scope="session")
def browser_instance(app_process):
    """Startet Chromium einmalig für die gesamte Session."""
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        yield browser
        browser.close()


@pytest.fixture
def page(browser_instance) -> Page:
    """
    Gibt eine frische Page für jeden Test zurück.
    Aktiviert Flutter-Accessibility und wartet auf vollständiges Laden.
    """
    context = browser_instance.new_context(viewport={"width": 1280, "height": 800})
    pg = context.new_page()
    pg.goto(APP_URL)

    pg.wait_for_selector("flt-semantics-placeholder", timeout=15000)
    time.sleep(3)

    pg.evaluate("document.querySelector('flt-semantics-placeholder').click()")
    time.sleep(1)

    pg.wait_for_selector('flt-semantics[role="tab"][aria-label="Übersicht"]', timeout=10000)

    yield pg

    context.close()
