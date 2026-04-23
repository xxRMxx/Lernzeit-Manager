# Lernzeit-Manager – Web-App Rewrite Design

**Datum:** 2026-04-21

## Ziel

Ersatz der Flet-Desktop/Android-App durch eine Django REST Framework + React PWA, die im Heimnetz und später öffentlich erreichbar ist und mehrere Nutzer mit geteilten Zielen unterstützt.

## Architektur

```
React PWA (Frontend)
  Tailwind CSS · React Query · Zustand
        │ REST API (JSON)
Django REST Framework (Backend)
  Auth · Permissions · Admin Panel
  Bestehende Python-Logik (src/logic/, src/types/, reducer.py)
  SQLite (lokal) → PostgreSQL (Server)
```

### Projektstruktur

```
Lernzeit-Manager/
├── backend/          – Django + DRF
│   └── src/          – bestehende logic/, types/ hierher verschoben
├── frontend/         – React PWA
└── data/             – bestehende JSON-Daten (Migration)
```

## Datenmodell

```
User (django-allauth)
 └── Goal
      ├── owner: User
      ├── visibility: PRIVATE | SHARED | COLLABORATIVE
      ├── GoalMembership (User ↔ Goal, Rolle: VIEWER | CONTRIBUTOR)
      ├── Plan
      ├── Milestone
      └── Session
           ├── goal: Goal
           └── user: User
```

**Sichtbarkeitsregeln:**
- `PRIVATE` – nur Owner
- `SHARED` – andere können lesen
- `COLLABORATIVE` – Mitglieder können Sessions/Meilensteine hinzufügen

## Auth

`django-allauth`: E-Mail/Passwort + Social Login (Google, GitHub)

## API-Endpunkte

```
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/logout/
GET  /api/auth/social/<provider>/

GET/POST        /api/goals/
GET/PATCH/DELETE /api/goals/{id}/
POST/DELETE     /api/goals/{id}/members/
PATCH           /api/goals/{id}/members/{user_id}/

GET/POST /api/goals/{id}/sessions/
GET/POST /api/goals/{id}/milestones/
GET/POST /api/goals/{id}/plans/

GET /api/goals/{id}/stats/
GET /api/dashboard/
```

Stoppuhr läuft im Browser (JS), nur Ergebnis wird per POST gespeichert.

## Frontend

- React + TypeScript + Tailwind CSS
- React Query für Server-State
- Zustand für Client-State
- PWA: manifest.json + Service Worker (installierbar auf Android/iOS)
- Mobile-first: Bottom-Nav auf Handy, Sidebar auf Desktop

## Deployment

**Phase 1 (Heimnetz):** Django 0.0.0.0:8000 + React Build, Zugriff via lokale IP

**Phase 2 (Öffentlich):** VPS, Nginx + Gunicorn, HTTPS (Let's Encrypt), PostgreSQL, eigene Domain
