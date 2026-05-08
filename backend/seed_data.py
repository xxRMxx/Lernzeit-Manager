import os
import django
from datetime import date, timedelta, datetime
from django.utils import timezone
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lernzeit.settings')
django.setup()

from apps.users.models import User
from apps.goals.models import Goal, Session, Milestone, Plan, RoughPlan, TimeSlot

def run():
    # 1. User anlegen oder holen
    email = "raphael.meier@iu-study.org"
    user, created = User.objects.get_or_create(email=email)
    if created:
        user.set_password("testpass123")
        user.display_name = "Test User"
        user.save()
        print(f"User {email} angelegt.")
    else:
        print(f"User {email} existiert bereits.")

    # Bereinigung (optional, falls man frisch starten will)
    # Goal.objects.filter(owner=user).delete()

    # 2. Ziele anlegen
    g1, _ = Goal.objects.get_or_create(
        owner=user,
        title="Masterarbeit schreiben",
        defaults={
            "description": "Forschungsarbeit zum Thema KI im Zeitmanagement",
            "target_hours": 300,
            "start_date": date.today() - timedelta(days=30),
            "end_date": date.today() + timedelta(days=150),
            "visibility": "PRIVATE"
        }
    )

    g2, _ = Goal.objects.get_or_create(
        owner=user,
        title="Spanisch B1",
        defaults={
            "description": "Vorbereitung auf das DELE Zertifikat",
            "target_hours": 100,
            "start_date": date.today() - timedelta(days=10),
            "end_date": date.today() + timedelta(days=100),
            "visibility": "SHARED"
        }
    )

    # 3. Planung hinzufügen
    Plan.objects.get_or_create(goal=g1, weekly_hours=15)
    Plan.objects.get_or_create(goal=g2, weekly_hours=5)

    today = date.today()
    RoughPlan.objects.get_or_create(goal=g1, year=today.year, month=today.month, defaults={"planned_hours": 60})
    
    # TimeSlots (Detailplanung)
    for i in range(1, 5):
        TimeSlot.objects.get_or_create(
            goal=g1, 
            date=today + timedelta(days=i), 
            defaults={"planned_minutes": 120, "note": "Bibliothek"}
        )
    # Ein verpasster Slot für die Erinnerung
    TimeSlot.objects.get_or_create(
        goal=g1, 
        date=today - timedelta(days=1), 
        defaults={"planned_minutes": 60, "note": "Hopsala"}
    )

    # 4. Meilensteine
    Milestone.objects.get_or_create(goal=g1, title="Exposé abgegeben", defaults={"status": "DONE", "target_date": today - timedelta(days=20)})
    Milestone.objects.get_or_create(goal=g1, title="Literaturrecherche abgeschlossen", defaults={"status": "OPEN", "target_date": today + timedelta(days=10)})
    Milestone.objects.get_or_create(goal=g2, title="Vokabeltest Lektion 1-5", defaults={"status": "DONE", "target_date": today - timedelta(days=5)})

    # 5. Sessions (Lernzeit) - Um den Chart und Streak zu füllen
    # Wir erzeugen Sessions für die letzten 14 Tage (mit Lücken für den Streak-Test)
    for i in range(0, 14):
        if i == 5: continue # Eine Lücke im Streak
        session_date = today - timedelta(days=i)
        start_time = timezone.make_aware(datetime.combine(session_date, datetime.min.time()) + timedelta(hours=10))
        
        Session.objects.get_or_create(
            goal=g1 if i % 2 == 0 else g2,
            user=user,
            started_at=start_time,
            defaults={
                "duration_seconds": random.randint(3600, 10800), # 1-3 Stunden
                "note": "Produktiv gelernt"
            }
        )

    print("Testdaten erfolgreich erstellt!")

if __name__ == "__main__":
    run()
