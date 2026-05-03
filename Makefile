# Lernzeit-Manager Makefile

.PHONY: help install-all run-flet test-flet test-e2e backend-run backend-migrate frontend-run frontend-build clean

PYTHON_FLET = .venv/bin/python3
PYTHON_BACKEND = backend/.venv/bin/python3

help:
	@echo "Verfügbare Befehle:"
	@echo "  make run-flet        - Startet die ursprüngliche Flet-Anwendung"
	@echo "  make test-flet       - Führt Unit-Tests für die Flet-Logik aus"
	@echo "  make test-e2e        - Führt E2E-Tests für die Flet-App aus"
	@echo ""
	@echo "  make backend-run     - Startet den Django Development Server"
	@echo "  make backend-migrate - Führt Django-Migrationen aus"
	@echo "  make backend-shell   - Öffnet die Django-Shell"
	@echo ""
	@echo "  make frontend-run    - Startet den Vite Development Server (React)"
	@echo "  make frontend-build  - Erstellt den Production-Build des Frontends"
	@echo "  make frontend-lint   - Führt ESLint für das Frontend aus"
	@echo ""
	@echo "  make install-all     - Installiert alle Abhängigkeiten (Root, Backend, Frontend)"
	@echo "  make clean           - Entfernt Caches und Build-Artefakte"

# --- Legacy Flet App ---
run-flet:
	$(PYTHON_FLET) main.py

test-flet:
	$(PYTHON_FLET) -m pytest tests/

test-e2e:
	$(PYTHON_FLET) -m pytest Tests/test_e2e.py -v

# --- Web Backend (Django) ---
backend-run:
	cd backend && ./.venv/bin/python3 manage.py runserver

backend-migrate:
	cd backend && ./.venv/bin/python3 manage.py makemigrations
	cd backend && ./.venv/bin/python3 manage.py migrate

backend-shell:
	cd backend && ./.venv/bin/python3 manage.py shell

# --- Web Frontend (React) ---
frontend-run:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

frontend-lint:
	cd frontend && npm run lint

# --- Setup & Maintenance ---
install-all:
	@echo "Installiere Root-Abhängigkeiten..."
	python3 -m venv .venv && $(PYTHON_FLET) -m pip install -r requirements.txt
	@echo "Installiere Backend-Abhängigkeiten..."
	cd backend && python3 -m venv .venv && ./.venv/bin/python3 -m pip install -r requirements.txt
	@echo "Installiere Frontend-Abhängigkeiten..."
	cd frontend && npm install

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	rm -rf frontend/dist
	rm -rf build/
