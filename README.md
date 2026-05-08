# 🎓 Lernzeit-Manager

Ein modernes Tool zur Planung, Nachverfolgung und Analyse von Lernzeiten, optimiert für Studierende und lebenslanges Lernen.

## 📜 Projekt-Historie & Wandel
Das Projekt wurde ursprünglich als lokale Desktop- und Android-App mit **Python Flet** entwickelt. Um eine echte Multi-User-Fähigkeit, nahtlose Cloud-Synchronisation und eine modernere Web-Erfahrung zu ermöglichen, wurde die Anwendung komplett auf eine **Web-Architektur** umgestellt. Sämtliche Legacy-Komponenten (Flet) wurden zugunsten dieses neuen Stacks entfernt.

## 🛠 Technologie-Stack

### Backend: Django REST Framework (DRF)
- **Sprache:** Python 3.12+
- **Authentifizierung:** E-Mail-basierter Login via `dj-rest-auth` & `allauth`.
- **Datenmodell:** UUID-basierte Primärschlüssel, PostgreSQL-kompatibel (aktuell SQLite für Entwicklung).
- **Kern-Features:** 
    - Komplexe Statistik-Engines (Streak-Berechnung, Wochen-Charts).
    - Granulare Berechtigungen für geteilte Lernziele.
    - Automatisierte Erinnerungslogik bei Inaktivität.

### Frontend: React PWA
- **Framework:** React + TypeScript + Vite.
- **Styling:** Tailwind CSS (Mobile-First, nativer Darkmode-Support).
- **State Management:** 
    - `React Query` (TanStack) für effizienten Server-Cache.
    - `Zustand` für leichtgewichtigen Client-State.
- **PWA:** Als Progressive Web App auf Smartphones installierbar.

## 🏗 Architektur-Highlights
- **3-Stufen-Planung:** Einzigartiges Modell bestehend aus:
    1. **Wochenziel:** Generelle Stunden-Vorgabe.
    2. **Grobplanung:** Monatliche Stunden-Ziele.
    3. **Feinplanung:** Konkrete Tages-Termine (TimeSlots).
- **Responsive UI:** Adaptive Navigation (Bottom-Nav auf Mobilgeräten, Sidebar auf Desktop).
- **Darkmode:** Volle Unterstützung für manuelles Umschalten oder automatische System-Anpassung.

## 🚀 Schritt-für-Schritt für Einsteiger

Du musst kein Profi sein, um die App zu starten. Folge einfach diesen vier Schritten:

### 1. Docker installieren
Docker sorgt dafür, dass die App auf jedem Rechner (Windows, Mac, Linux) exakt gleich funktioniert.
*   **Windows & Mac:** Lade [Docker Desktop](https://www.docker.com/products/docker-desktop/) herunter und installiere es. Starte das Programm danach einmal.
*   **Linux:** Installiere `docker` und `docker-compose` über deinen Paketmanager.

### 2. Projekt herunterladen (Clonen)
Hol dir den Code auf deinen Rechner. Öffne dein Terminal (z.B. PowerShell oder Eingabeaufforderung) und gib ein:
```bash
git clone https://github.com/xxRMxx/Lernzeit-Manager.git
cd Lernzeit-Manager
```

### 3. Die App starten
Jetzt lassen wir Docker die Arbeit machen. Gib im Terminal ein:
```bash
make docker-up
```
*Falls dein Rechner den Befehl `make` nicht kennt (oft bei Windows), nutze stattdessen:*
```bash
docker-compose up --build
```
Beim ersten Mal dauert es ein paar Minuten, da Docker alles vorbereitet. Sobald im Terminal keine neuen Zeilen mehr erscheinen, ist alles bereit.

### 4. Im Browser ansehen
Öffne deinen Browser und besuche:
- **Die App:** [http://localhost:5173](http://localhost:5173)
- **Die Datenbank-Verwaltung:** [http://localhost:8000/admin](http://localhost:8000/admin)

---

## 🐳 Cross-Platform mit Docker (für Fortgeschrittene)
Um die Anwendung unabhängig vom Betriebssystem (Windows, Mac, Linux) zu starten, kannst du Docker nutzen.

```bash
# Gesamte Anwendung starten
make docker-up

# Docker-Images bauen
make docker-build

# Docker-Umgebung stoppen
make docker-down
```
*Nach dem Start ist die App unter http://localhost:5173 erreichbar.*

## 🚀 Quickstart für lokale Entwicklung
Falls du kein Docker nutzen möchtest, kannst du die Anwendung auch nativ installieren:
```bash
make install-all
```
*Installiert alle Python-Abhängigkeiten im Backend (Venv) und Node-Module im Frontend.*

### 2. Datenbank-Setup
```bash
make backend-migrate
```

### 3. Testdaten generieren (Empfohlen)
Um die App sofort mit Inhalten (Zielen, Sessions, Charts) zu sehen:
```bash
cd backend && ./.venv/bin/python3 seed_data.py
```

### 4. Anwendung starten
Du benötigst zwei Terminals:
- **Terminal 1 (API):** `make backend-run` (Port 8000)
- **Terminal 2 (Web):** `make frontend-run` (Port 5173)

---

## 📂 Struktur
- `backend/` - Django Projekt & Apps.
- `backend/src/logic/` - Pure Python Logik (Berechnungen, Statistik), entkoppelt vom Framework.
- `frontend/` - React Anwendung.
- `docs/` - Spezifikationen und Design-Entscheidungen.
