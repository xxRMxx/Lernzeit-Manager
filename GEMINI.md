# GEMINI.md - Lernzeit-Manager

## Project Overview
The **Lernzeit-Manager** is a modern web application designed for students and life-long learners to plan, track, and analyze their study time. Originally a Python Flet application, it has been fully migrated to a distributed Web-App architecture to support multi-user functionality and mobile-first accessibility.

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

---

## Legacy Flet Application (Maintenance)

The original Python Flet application is still available in the root directory for reference and maintenance.

### Commands

```bash
# Start App (opens browser at http://localhost:8550)
.venv/bin/python3 main.py

# Start App on a different port
FLET_PORT=8080 .venv/bin/python3 main.py

# Run all E2E tests (automatically starts app on port 8552)
.venv/bin/python3 -m pytest Tests/test_e2e.py -v

# Run a specific test or class
.venv/bin/python3 -m pytest Tests/test_e2e.py::TestLernzielErstellen -v
.venv/bin/python3 -m pytest Tests/test_e2e.py::TestLernzielErstellen::test_lernziel_erstellen -v

# Filter tests by name pattern
.venv/bin/python3 -m pytest Tests/test_e2e.py -k "navigation" -v
```

### Architecture

The legacy project follows a **Redux Pattern** with strict layer separation and functional principles.

#### Data Flow
```
Browser Event → View → store.dispatch(Action) → reduce(state, action) → new AppState
                                                           ↓
                                                    save_state() + render(state)
```

#### Layers (Strict Import Rules)

| Layer | Path | Rules |
|---|---|---|
| **Types** | `src/types/` | Frozen dataclasses, no IO, no imports from other `src` modules |
| **Logic** | `src/logic/` | Pure functions, imports only `src/types/` |
| **Persistence** | `src/persistence/` | `serializer.py` is pure, `file_store.py` is the only IO except Store |
| **Store** | `src/store/` | `actions.py` + `reducer.py` are pure; `store.py` is the only non-pure class |
| **Views** | `src/views/` | Flet UI, only allowed to call `store.dispatch()` and read `state` |

#### Key Files
- `src/types/app_state.py` – Root state, single source of truth.
- `src/store/reducer.py` – All state transitions via `match/case`.
- `src/store/store.py` – Encapsulates persistence + observer notifications.
- `src/views/app_view.py` – Navigation, view routing, `render()` subscriber, reminder background task.

#### State Changes
Never mutate state directly. Use `dataclasses.replace()` exclusively:
```python
return replace(state, goals=(*state.goals, new_goal))
```

### Flet-specific Notes (Version 0.82)
- Use `ft.run()` instead of `ft.app()` (deprecated).
- Use `page.show_dialog(dlg)` / `page.pop_dialog()` instead of `page.open()` / `page.close()`.
- Use `ft.Alignment(0, 0)` instead of `ft.alignment.center`.
- Use `ft.Colors.SURFACE_CONTAINER_HIGH` instead of `ft.Colors.SURFACE_VARIANT` (non-existent).
- Use `ft.Tab(label=...)` instead of `ft.Tab(text=...)`.
- Use `ft.Tabs(length=N, content=ft.Column([ft.TabBar(...), ft.TabBarView(...)]))` for tab layouts.
- UI Date Format: `DD.MM.YYYY`, ISO conversion: `"-".join(reversed(d.strip().split(".")))`.

### E2E Tests (Playwright + Flutter Web)
Flutter Web renders via Canvas. Accessibility must be enabled first (handled in `conftest.py`).

**Selectors:**
- Navigation: `flt-semantics[role="tab"][aria-label="<Name>"]`
- Buttons: `flt-semantics[role="button"]` filtered by `.filter(has_text=...)`
- FABs: `flt-semantics[aria-label="<tooltip>"]`
- Dialogs: `flt-semantics[role="alertdialog"]`
- Text in Cards/Lists: `flt-semantics[aria-label*="<Text>"]` (do not use `<span>`)

**Input Fields:** Click by coordinates determined via JS, then `page.mouse.click(x, y)`. Avoid `element.click()` in `page.evaluate()` as it might skip Flutter's focus handlers.

**Field Indices in Dialogs:**
- Goal Dialog: 0=Title, 1=Description, 2=Hours, 3=Start Date, 4=End Date.
- Milestone Dialog: Dropdowns don't match -> 0=Label, 1=Target Date, 2=Note.

