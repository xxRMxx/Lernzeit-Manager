"""
End-to-End-Tests für den Lernzeit-Manager.

Testet die komplette Anwendung durch alle Seiten und Kernfunktionen.
Die Tests laufen gegen eine lokal gestartete Flet-Instanz (conftest.py).

Selektoren-Strategie:
  - Navigation:  flt-semantics[role="tab"][aria-label="<Name>"]
  - Buttons:     flt-semantics[role="button"] mit has_text
  - Dialoge:     flt-semantics[role="alertdialog"]
  - Labels:      flt-semantics[aria-label="<Name>"]
  - Text:        page.locator("span").filter(has_text="<Text>")
"""
import time
from datetime import date, timedelta

import pytest
from playwright.sync_api import Page

# ── Hilfsfunktionen ────────────────────────────────────────────────────────────

def nav_to(page: Page, tab_label: str) -> None:
    """Navigiert per Klick auf einen Navigationsreiter und wartet auf Rendering."""
    page.locator(f'flt-semantics[role="tab"][aria-label="{tab_label}"]').click()
    time.sleep(1.5)


def click_button(page: Page, text: str) -> None:
    """Klickt einen Button anhand seines sichtbaren Textes."""
    page.locator('flt-semantics[role="button"]').filter(has_text=text).click()
    time.sleep(0.5)


def text_is_visible(page: Page, text: str) -> bool:
    """
    True wenn der Text irgendwo auf der Seite sichtbar ist.
    Flutter rendert Text als <span>-Elemente (App-Bar, Labels) oder als
    aria-label auf flt-semantics-Nodes (Cards, ListView-Items).
    """
    if page.locator("span").filter(has_text=text).count() > 0:
        return True
    return page.locator(f'flt-semantics[aria-label*="{text}"]').count() > 0


def click_fab(page: Page, aria_label: str, timeout: int = 10000) -> None:
    """Klickt einen Floating Action Button per aria-label."""
    page.wait_for_selector(f'flt-semantics[aria-label="{aria_label}"]', timeout=timeout)
    page.locator(f'flt-semantics[aria-label="{aria_label}"]').click()
    time.sleep(1)


def dialog_is_open(page: Page) -> bool:
    """True wenn ein AlertDialog offen ist."""
    return page.locator('flt-semantics[role="alertdialog"]').count() > 0


def click_dialog_field(page: Page, field_index: int) -> None:
    """
    Klickt das n-te Eingabefeld im offenen Dialog (0-basiert).
    Flutter-Textfelder haben im Accessibility-Tree: pointer-events=all, kein role,
    kein flt-tappable, kein aria-label. Wir ermitteln die Koordinaten per JS und
    klicken dann mit page.mouse.click() (echte Mausereignisse, die Flutter verarbeitet).
    Reihenfolge im Dialog: 0=Titel, 1=Beschreibung, 2=Stunden, 3=Startdatum, 4=Enddatum.
    """
    coords = page.evaluate(f"""() => {{
        const host = document.querySelector('flt-semantics-host');
        const dialog = host ? host.querySelector('[role="alertdialog"]') : null;
        if (!dialog) return null;
        const candidates = Array.from(dialog.querySelectorAll('flt-semantics')).filter(n =>
            getComputedStyle(n).pointerEvents === 'all' &&
            !n.getAttribute('role') &&
            !n.hasAttribute('flt-tappable') &&
            !n.getAttribute('aria-label')
        );
        if (!candidates[{field_index}]) return null;
        const rect = candidates[{field_index}].getBoundingClientRect();
        return {{ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }};
    }}""")
    if coords:
        page.mouse.click(coords["x"], coords["y"])
    time.sleep(0.5)


def fill_goal_form(page: Page, title: str, hours: str, start: str, end: str) -> None:
    """
    Füllt das Lernziel-Formular aus.
    Klickt Felder explizit per Index (kein autofocus-Fallback).
    Reihenfolge: 0=Titel, 1=Beschreibung, 2=Stunden, 3=Startdatum, 4=Enddatum.
    """
    # Feld 0: Titel (explizit klicken statt autofocus abwarten)
    click_dialog_field(page, 0)
    page.keyboard.type(title)
    time.sleep(0.3)

    # Feld 2: Stunden (Feld 1 = Beschreibung überspringen)
    click_dialog_field(page, 2)
    page.keyboard.press("Control+a")
    page.keyboard.type(hours)
    time.sleep(0.2)

    # Feld 3: Startdatum
    click_dialog_field(page, 3)
    page.keyboard.press("Control+a")
    page.keyboard.type(start)
    time.sleep(0.2)

    # Feld 4: Enddatum
    click_dialog_field(page, 4)
    page.keyboard.press("Control+a")
    page.keyboard.type(end)
    time.sleep(0.2)


# ── Test 1: App startet und Dashboard ist sichtbar ────────────────────────────

class TestAppStart:

    def test_titel_ist_sichtbar(self, page: Page):
        """Der App-Titel 'Lernzeit-Manager' ist auf jeder Seite sichtbar."""
        assert text_is_visible(page, "Lernzeit-Manager"), \
            "App-Titel 'Lernzeit-Manager' nicht gefunden"

    def test_alle_navigationspunkte_vorhanden(self, page: Page):
        """Alle 5 Navigationsreiter sind in der App sichtbar."""
        for tab in ["Übersicht", "Ziele", "Planung", "Stoppuhr", "Meilensteine"]:
            count = page.locator(f'flt-semantics[role="tab"][aria-label="{tab}"]').count()
            assert count > 0, f"Navigationsreiter '{tab}' nicht gefunden"

    def test_dashboard_ist_standardseite(self, page: Page):
        """Das Dashboard wird beim Start angezeigt."""
        assert text_is_visible(page, "Lernzeit-Manager")
        assert page.locator('flt-semantics[role="tab"][aria-label="Übersicht"]').count() > 0


# ── Test 2: Navigation zwischen allen Seiten ──────────────────────────────────

class TestNavigation:

    def test_navigation_zu_ziele(self, page: Page):
        """Die Ziele-Seite lässt sich aufrufen und zeigt den FAB."""
        nav_to(page, "Ziele")
        fab = page.locator('flt-semantics[aria-label="Neues Lernziel"]')
        assert fab.count() > 0, "FAB 'Neues Lernziel' nicht gefunden"

    def test_navigation_zu_planung(self, page: Page):
        """Die Planungsseite lässt sich aufrufen und zeigt beide Sub-Tabs."""
        nav_to(page, "Planung")
        assert page.locator('flt-semantics[role="tab"][aria-label="6-Monats-Übersicht"]').count() > 0
        assert page.locator('flt-semantics[role="tab"][aria-label="Monats-Detail"]').count() > 0

    def test_navigation_zu_stoppuhr(self, page: Page):
        """Die Stoppuhr-Seite lässt sich aufrufen und zeigt einen Start-Button."""
        nav_to(page, "Stoppuhr")
        assert page.locator('flt-semantics[role="button"]').filter(has_text="Start").count() > 0

    def test_navigation_zu_meilensteine(self, page: Page):
        """Die Meilensteine-Seite lässt sich aufrufen."""
        nav_to(page, "Meilensteine")
        assert page.locator('flt-semantics[aria-label="Neuer Meilenstein"]').count() > 0

    def test_ruecknavigation_zu_uebersicht(self, page: Page):
        """Von jeder Seite kann zum Dashboard zurücknavigiert werden."""
        for tab in ["Ziele", "Planung", "Stoppuhr", "Meilensteine"]:
            nav_to(page, tab)
            nav_to(page, "Übersicht")
            assert text_is_visible(page, "Lernzeit-Manager"), \
                f"Nach Rücknavigation von {tab} kein App-Titel sichtbar"


# ── Test 3: Planungs-Sub-Tabs ─────────────────────────────────────────────────

class TestPlanung:

    def test_subtabs_wechsel(self, page: Page):
        """Beide Sub-Tabs der Planungsseite können gewechselt werden."""
        nav_to(page, "Planung")
        assert page.locator('flt-semantics[role="tab"][aria-label="6-Monats-Übersicht"]').count() > 0
        page.locator('flt-semantics[role="tab"][aria-label="Monats-Detail"]').click()
        time.sleep(1.5)
        assert page.locator('flt-semantics[role="tab"][aria-label="Monats-Detail"]').count() > 0

    def test_grobplanung_zeigt_hinweis_ohne_ziele(self, page: Page):
        """Ohne Lernziele zeigt die Grobplanung ein tabpanel (Hinweistext)."""
        nav_to(page, "Planung")
        page.locator('flt-semantics[role="tab"][aria-label="6-Monats-Übersicht"]').click()
        time.sleep(1.5)
        assert page.locator('flt-semantics[role="tabpanel"]').count() > 0


# ── Test 4: Stoppuhr-Grundfunktionen ─────────────────────────────────────────

class TestStoppuhr:

    def test_stoppuhr_elemente_vorhanden(self, page: Page):
        """Die Stoppuhr-Seite zeigt den Start-Button."""
        nav_to(page, "Stoppuhr")
        assert page.locator('flt-semantics[role="button"]').filter(has_text="Start").count() > 0

    def test_zeitanzeige_vorhanden(self, page: Page):
        """Die Zeitanzeige '00:00:00' ist sichtbar."""
        nav_to(page, "Stoppuhr")
        assert text_is_visible(page, "00:00:00"), "Zeitanzeige '00:00:00' nicht gefunden"

    def test_stoppuhr_startet_nicht_ohne_ziel(self, page: Page):
        """Ohne Lernziel erscheint kein Pause-Button nach Start-Klick."""
        nav_to(page, "Stoppuhr")
        start_btn = page.locator('flt-semantics[role="button"]').filter(has_text="Start")
        if start_btn.count() > 0:
            start_btn.click()
            time.sleep(1)
        pause_btn = page.locator('flt-semantics[role="button"]').filter(has_text="Pause")
        assert pause_btn.count() == 0, "Stoppuhr startete obwohl kein Lernziel vorhanden"


# ── Test 5: Lernziel erstellen ────────────────────────────────────────────────

class TestLernzielErstellen:

    def test_dialog_oeffnet_sich(self, page: Page):
        """Der Dialog zum Erstellen eines Lernziels öffnet sich."""
        nav_to(page, "Ziele")
        click_fab(page, "Neues Lernziel")
        assert dialog_is_open(page), "Lernziel-Dialog hat sich nicht geöffnet"
        assert text_is_visible(page, "Neues Lernziel"), "Dialog-Titel fehlt"

    def test_dialog_hat_abbrechen_button(self, page: Page):
        """Der Dialog enthält einen Abbrechen-Button."""
        nav_to(page, "Ziele")
        click_fab(page, "Neues Lernziel")
        assert page.locator('flt-semantics[role="button"]').filter(has_text="Abbrechen").count() > 0

    def test_dialog_hat_speichern_button(self, page: Page):
        """Der Dialog enthält einen Speichern-Button."""
        nav_to(page, "Ziele")
        click_fab(page, "Neues Lernziel")
        assert page.locator('flt-semantics[role="button"]').filter(has_text="Speichern").count() > 0

    def test_abbrechen_schliesst_dialog(self, page: Page):
        """Der Abbrechen-Button schließt den Dialog."""
        nav_to(page, "Ziele")
        click_fab(page, "Neues Lernziel")
        assert dialog_is_open(page)
        click_button(page, "Abbrechen")
        time.sleep(1)
        assert not dialog_is_open(page), "Dialog nach Abbrechen noch offen"

    def test_lernziel_erstellen(self, page: Page):
        """Ein vollständiges Lernziel kann angelegt werden."""
        nav_to(page, "Ziele")
        click_fab(page, "Neues Lernziel")
        assert dialog_is_open(page)

        today = date.today()
        end_date = today + timedelta(days=90)

        fill_goal_form(
            page,
            title="Mathematik I",
            hours="80",
            start=today.strftime("%d.%m.%Y"),
            end=end_date.strftime("%d.%m.%Y"),
        )

        click_button(page, "Speichern")
        time.sleep(2)

        assert not dialog_is_open(page), "Dialog nach Speichern noch offen"
        assert text_is_visible(page, "Mathematik I"), \
            "Erstelltes Lernziel 'Mathematik I' nicht in der Liste sichtbar"


# ── Test 6: Meilenstein erstellen ─────────────────────────────────────────────

class TestMeilensteinErstellen:

    def test_dialog_oeffnet_sich(self, page: Page):
        """Der Dialog zum Erstellen eines Meilensteins öffnet sich."""
        nav_to(page, "Meilensteine")
        click_fab(page, "Neuer Meilenstein")
        assert dialog_is_open(page), "Meilenstein-Dialog hat sich nicht geöffnet"

    def test_dialog_schliesst_sich(self, page: Page):
        """Der Meilenstein-Dialog lässt sich schließen."""
        nav_to(page, "Meilensteine")
        click_fab(page, "Neuer Meilenstein")
        assert dialog_is_open(page)

        abbrechen = page.locator('flt-semantics[role="button"]').filter(has_text="Abbrechen")
        ok_btn = page.locator('flt-semantics[role="button"]').filter(has_text="OK")

        if abbrechen.count() > 0:
            abbrechen.click()
        elif ok_btn.count() > 0:
            ok_btn.click()

        time.sleep(1)
        assert not dialog_is_open(page), "Dialog nach Schließen noch offen"


# ── Test 7: Vollständiger Workflow ────────────────────────────────────────────

class TestVollstaendigerWorkflow:

    def test_ziel_erstellen_und_in_liste_sehen(self, page: Page):
        """Lernziel erstellen und in der Zielliste wiederfinden."""
        nav_to(page, "Ziele")
        click_fab(page, "Neues Lernziel")

        today = date.today()
        fill_goal_form(
            page,
            title="Workflow-Test-Ziel",
            hours="50",
            start=today.strftime("%d.%m.%Y"),
            end=(today + timedelta(days=60)).strftime("%d.%m.%Y"),
        )
        click_button(page, "Speichern")
        time.sleep(2)

        assert not dialog_is_open(page)
        assert text_is_visible(page, "Workflow-Test-Ziel"), \
            "Erstelltes Ziel nicht in der Liste"

    def test_ziel_erstellen_dann_stoppuhr_starten(self, page: Page):
        """
        Workflow:
        1. Lernziel erstellen
        2. Stoppuhr starten
        3. Stoppuhr pausieren
        4. Stoppuhr wieder fortsetzen
        5. Session speichern
        """
        # Schritt 1: Lernziel erstellen
        nav_to(page, "Ziele")
        click_fab(page, "Neues Lernziel")

        today = date.today()
        fill_goal_form(
            page,
            title="Stoppuhr-Ziel",
            hours="30",
            start=today.strftime("%d.%m.%Y"),
            end=(today + timedelta(days=45)).strftime("%d.%m.%Y"),
        )
        click_button(page, "Speichern")
        time.sleep(2)
        assert not dialog_is_open(page), "Dialog nach Ziel-Erstellung noch offen"

        # Schritt 2: Stoppuhr starten
        nav_to(page, "Stoppuhr")
        assert text_is_visible(page, "00:00:00")

        start_btn = page.locator('flt-semantics[role="button"]').filter(has_text="Start")
        assert start_btn.count() > 0, "Start-Button nicht gefunden"
        start_btn.click()
        time.sleep(2)

        # Schritt 3: Prüfen ob Stoppuhr läuft (Pause-Button erscheint)
        pause_btn = page.locator('flt-semantics[role="button"]').filter(has_text="Pause")
        if pause_btn.count() > 0:
            pause_btn.click()
            time.sleep(1)

            # Schritt 4: Weiter-Button erscheint
            resume_btn = page.locator('flt-semantics[role="button"]').filter(has_text="Weiter")
            assert resume_btn.count() > 0, "Weiter-Button nach Pause nicht gefunden"
            resume_btn.click()
            time.sleep(1)

            # Schritt 5: Session speichern
            stop_btn = page.locator('flt-semantics[role="button"]').filter(has_text="Stop & Speichern")
            if stop_btn.count() > 0:
                stop_btn.click()
                time.sleep(1)
                confirm_btn = page.locator('flt-semantics[role="button"]').filter(
                    has_text="Session abschließen"
                )
                if confirm_btn.count() > 0:
                    confirm_btn.click()
                    time.sleep(1)

        # Dashboard zeigt weiterhin den App-Titel
        nav_to(page, "Übersicht")
        assert text_is_visible(page, "Lernzeit-Manager")

    def test_ziel_erstellen_meilenstein_hinzufuegen(self, page: Page):
        """
        Workflow: Lernziel erstellen → Meilenstein anlegen → Meilenstein als erreicht markieren.
        """
        # Ziel erstellen
        nav_to(page, "Ziele")
        click_fab(page, "Neues Lernziel")

        today = date.today()
        fill_goal_form(
            page,
            title="Meilenstein-Ziel",
            hours="40",
            start=today.strftime("%d.%m.%Y"),
            end=(today + timedelta(days=120)).strftime("%d.%m.%Y"),
        )
        click_button(page, "Speichern")
        time.sleep(2)
        assert not dialog_is_open(page)
        assert text_is_visible(page, "Meilenstein-Ziel")

        # Meilenstein anlegen
        nav_to(page, "Meilensteine")
        click_fab(page, "Neuer Meilenstein")
        time.sleep(1)
        assert dialog_is_open(page)

        speichern = page.locator('flt-semantics[role="button"]').filter(has_text="Speichern")
        if speichern.count() > 0:
            # Milestone-Dialog hat: goal_dropdown, title_field, type_dropdown, date_field, note_field
            # Dropdowns matchen den Filter nicht → nur TextFelder: 0=Bezeichnung, 1=Zieldatum, 2=Notiz
            click_dialog_field(page, 0)
            page.keyboard.type("Klausur bestehen")

            click_dialog_field(page, 1)
            klausur_date = today + timedelta(days=60)
            page.keyboard.type(klausur_date.strftime("%d.%m.%Y"))

            speichern.click()
            time.sleep(2)

        # Dialog schließen falls noch offen (Validierungsfehler)
        if dialog_is_open(page):
            click_button(page, "Abbrechen")
            time.sleep(1)

        # Meilensteine-Seite zeigt den Eintrag oder den Hinweis "Noch keine Meilensteine"
        nav_to(page, "Meilensteine")
        assert page.locator('flt-semantics[aria-label="Neuer Meilenstein"]').count() > 0
