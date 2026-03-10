# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Befehle

```bash
# App starten (öffnet Browser auf http://localhost:8550)
.venv/bin/python3 main.py

# App auf anderem Port starten
FLET_PORT=8080 .venv/bin/python3 main.py

# Alle E2E-Tests ausführen (startet App automatisch auf Port 8552)
.venv/bin/python3 -m pytest Tests/test_e2e.py -v

# Einzelnen Test oder Klasse ausführen
.venv/bin/python3 -m pytest Tests/test_e2e.py::TestLernzielErstellen -v
.venv/bin/python3 -m pytest Tests/test_e2e.py::TestLernzielErstellen::test_lernziel_erstellen -v

# Tests nach Namenspattern filtern
.venv/bin/python3 -m pytest Tests/test_e2e.py -k "navigation" -v
```

## Architektur

Das Projekt folgt einem **Redux-Pattern** mit strikter Schichtentrennung und funktionalen Prinzipien.

### Datenfluss

```
Browser-Ereignis → View → store.dispatch(Action) → reduce(state, action) → neuer AppState
                                                           ↓
                                                    save_state() + render(state)
```

### Schichten (Importregeln strikt einhalten)

| Schicht | Pfad | Regeln |
|---|---|---|
| **Types** | `src/types/` | Frozen dataclasses, kein IO, keine Imports aus anderen `src`-Modulen |
| **Logic** | `src/logic/` | Pure functions, importiert nur `src/types/` |
| **Persistence** | `src/persistence/` | `serializer.py` pure, `file_store.py` einziges IO außer Store |
| **Store** | `src/store/` | `actions.py` + `reducer.py` pure; `store.py` einzige nicht-pure Klasse |
| **Views** | `src/views/` | Flet UI, darf nur `store.dispatch()` aufrufen und `state` lesen |

### Schlüsseldateien

- `src/types/app_state.py` – Root-State, einzige Source of Truth
- `src/store/reducer.py` – alle State-Transitionen via `match/case`
- `src/store/store.py` – kapselt Persistenz + Observer-Benachrichtigung
- `src/views/app_view.py` – Navigation, View-Routing, `render()`-Subscriber, Reminder-Hintergrundtask

### State-Änderungen

Niemals State direkt mutieren. Ausschließlich `dataclasses.replace()` verwenden:
```python
return replace(state, goals=(*state.goals, new_goal))
```

Neue Features benötigen: neuen Typ in `src/types/`, neue Action in `src/store/actions.py`, neuen `case` im Reducer, ggf. neue Logic-Funktion.

## Flet-spezifische Hinweise (Version 0.82)

- `ft.run()` statt `ft.app()` (deprecated)
- `page.show_dialog(dlg)` / `page.pop_dialog()` statt `page.open()` / `page.close()`
- `ft.Alignment(0, 0)` statt `ft.alignment.center`
- `ft.Colors.SURFACE_CONTAINER_HIGH` statt `ft.Colors.SURFACE_VARIANT` (existiert nicht)
- `ft.Tab(label=...)` statt `ft.Tab(text=...)`
- `ft.Tabs(length=N, content=ft.Column([ft.TabBar(...), ft.TabBarView(...)]))` für Tab-Layouts
- Datumsformat im UI: `TT.MM.JJJJ`, Konvertierung zu ISO: `"-".join(reversed(d.strip().split(".")))`

## E2E-Tests (Playwright + Flutter Web)

Flutter Web rendert per Canvas. Accessibility muss erst aktiviert werden (geschieht in `conftest.py`).

**Selektoren:**
- Navigation: `flt-semantics[role="tab"][aria-label="<Name>"]`
- Buttons: `flt-semantics[role="button"]` mit `.filter(has_text=...)`
- FABs: `flt-semantics[aria-label="<tooltip>"]`
- Dialoge: `flt-semantics[role="alertdialog"]`
- Text in Cards/Listen: `flt-semantics[aria-label*="<Text>"]` (nicht `<span>`)

**Textfelder anklicken:** Koordinaten per JS ermitteln, dann `page.mouse.click(x, y)` – kein `element.click()` in `page.evaluate()`, da Flutter's Focus-Handler sonst nicht ausgelöst wird.

**Feld-Indices im Dialog** (Filter: pointer-events=all, kein role, kein flt-tappable, kein aria-label):
- Lernziel-Dialog: 0=Titel, 1=Beschreibung, 2=Stunden, 3=Startdatum, 4=Enddatum
- Meilenstein-Dialog: Dropdowns matchen nicht → 0=Bezeichnung, 1=Zieldatum, 2=Notiz

**Test-Isolation:** `conftest.py` sichert `data/state.json` vor jedem Testlauf und stellt ihn danach wieder her.
