# GEMINI.md - Lernzeit-Manager

## Project Overview
The **Lernzeit-Manager** is a modern web application designed for students and life-long learners to plan, track, and analyze their study time. It has been fully migrated to a distributed Web-App architecture to support multi-user functionality and mobile-first accessibility.

### Architecture & Tech Stack
- **Backend:** Django REST Framework (DRF) with Python 3.12+.
    - **Authentication:** Email-based (no usernames) via `dj-rest-auth`.
    - **Models:** Uses UUIDs for primary keys to ensure global uniqueness.
    - **Logic:** Core business logic (stats, streak, planning) is isolated in `backend/src/logic/` as pure Python functions.
- **Frontend:** React PWA with TypeScript and Vite.
    - **Styling:** Tailwind CSS with a comprehensive manual and system-based Dark Mode.
    - **State Management:** `React Query` (server-side cache) and `Zustand` (client-side state).
- **Environment:** Containerized using Docker and orchestrated with Docker Compose.

## Building and Running

The project utilizes a root-level `Makefile` to simplify operations across Docker and local environments.

### Standard Workflow (Docker)
- **Start Stack:** `make docker-up` (Runs API at :8000 and Frontend at :5173).
- **Rebuild Images:** `make docker-build`.
- **Stop Stack:** `make docker-down`.

### Local Development (Native)
- **Install All:** `make install-all` (Backend Venv + Frontend Node Modules).
- **Backend:** `make backend-run` / `make backend-migrate`.
- **Frontend:** `make frontend-run` / `make frontend-build`.

### Data Initialization
To populate the database with realistic test data (goals, sessions, milestones, plans):
```bash
cd backend && ./.venv/bin/python3 seed_data.py
```

## Development Conventions

### Coding Style
- **Mobile-First:** All UI components must be optimized for small screens first (using Tailwind's `md:` and `lg:` modifiers for larger displays).
- **Dark Mode:** Every UI element must support the `.dark` class. Use `dark:bg-gray-800`, `dark:text-white`, etc.
- **Components:** Prefer functional components and custom hooks for logic reuse.

### Backend Principles
- **UUIDs:** Always use `id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`.
- **Permissions:** Use the custom `CanAccessGoal` permission for any endpoint dealing with goal-related data.
- **Serializers:** Maintain separate serializers for list views (`GoalListSerializer`) and detail views (`GoalSerializer`) to optimize payload size.

### Planning Model
The application follows a strict 3-step planning hierarchy:
1. **Target Hours:** Overall goal duration.
2. **Rough Plan:** Monthly hour targets (`RoughPlan` model).
3. **Time Slots:** Specific daily study appointments (`TimeSlot` model).

## Project Structure
- `/backend`: Django project files.
- `/backend/apps`: Functional Django applications (goals, users).
- `/backend/src/logic`: Framework-independent business logic.
- `/frontend`: React application.
- `/docs`: Architectural specs and legacy design docs.
- `docker-compose.yml`: Main orchestration file.
