# Lernzeit-Manager Makefile

.PHONY: help backend-run backend-migrate backend-shell frontend-run frontend-build frontend-lint install-all clean docker-up docker-build docker-down

PYTHON_BACKEND = backend/.venv/bin/python3

help:
	@echo "Verfügbare Befehle:"
	@echo "  make docker-up       - Startet die Container (API: 8000, Frontend: 5173)"
	@echo "  make docker-build    - Baut die Docker-Images neu"
	@echo "  make docker-down     - Stoppt die Container"
	@echo ""
	@echo "  make backend-run     - Startet den Django Development Server"
	@echo "  make backend-migrate - Führt Django-Migrationen aus"
	@echo "  make backend-shell   - Öffnet die Django-Shell"
	@echo ""
	@echo "  make frontend-run    - Startet den Vite Development Server (React)"
	@echo "  make frontend-build  - Erstellt den Production-Build des Frontends"
	@echo "  make frontend-lint   - Führt ESLint für das Frontend aus"
	@echo ""
	@echo "  make install-all     - Installiert alle Abhängigkeiten (Backend, Frontend)"
	@echo "  make clean           - Entfernt Caches und Build-Artefakte"

# --- Docker ---
docker-up:
	docker compose up -d

docker-build:
	docker compose build

docker-down:
	docker compose down

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
	@echo "Installiere Backend-Abhängigkeiten..."
	cd backend && python3 -m venv .venv && ./.venv/bin/python3 -m pip install -r requirements.txt
	@echo "Installiere Frontend-Abhängigkeiten..."
	cd frontend && npm install --legacy-peer-deps

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	rm -rf frontend/dist
	rm -rf build/
