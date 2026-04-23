# Backend: Django REST Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Django + DRF Backend mit Auth, Multi-User-Modellen und REST-API für den Lernzeit-Manager aufbauen.

**Architecture:** Django-Projekt in `backend/`, zwei Apps (`users`, `goals`). Bestehende Logik aus `src/logic/` und `src/types/` wird nach `backend/src/` kopiert und als pure Python-Funktionen weiterverwendet. SQLite für Entwicklung.

**Tech Stack:** Python 3.12+, Django 5.x, djangorestframework, django-allauth, dj-rest-auth, django-cors-headers, Pillow

---

## Dateistruktur

```
backend/
├── manage.py
├── requirements.txt
├── lernzeit/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── users/
│   │   ├── __init__.py
│   │   ├── models.py          – erweitertes User-Modell
│   │   ├── serializers.py     – UserSerializer
│   │   ├── views.py           – Profil-Endpunkte
│   │   └── urls.py
│   └── goals/
│       ├── __init__.py
│       ├── models.py          – Goal, GoalMembership, Plan, Session, Milestone
│       ├── serializers.py     – alle Serializer
│       ├── permissions.py     – IsOwnerOrMember etc.
│       ├── views.py           – alle ViewSets
│       └── urls.py
└── src/                       – kopiert aus bestehendem src/
    ├── logic/
    ├── types/
    └── store/
```

---

### Task 1: Django-Projekt aufsetzen

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/lernzeit/settings.py`
- Create: `backend/lernzeit/urls.py`
- Create: `backend/manage.py`

- [ ] **Schritt 1: Verzeichnis anlegen und virtuelle Umgebung erstellen**

```bash
mkdir -p backend/apps/users backend/apps/goals backend/lernzeit backend/src
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

- [ ] **Schritt 2: `requirements.txt` erstellen**

```
Django==5.0.6
djangorestframework==3.15.2
django-allauth==64.3.0
dj-rest-auth==6.0.0
django-cors-headers==4.4.0
djangorestframework-simplejwt==5.3.1
Pillow==10.4.0
```

- [ ] **Schritt 3: Dependencies installieren**

```bash
pip install -r requirements.txt
```

- [ ] **Schritt 4: Django-Projekt initialisieren**

```bash
django-admin startproject lernzeit .
```

- [ ] **Schritt 5: Apps anlegen**

```bash
python manage.py startapp users apps/users
python manage.py startapp goals apps/goals
```

- [ ] **Schritt 6: `backend/lernzeit/settings.py` vollständig schreiben**

```python
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'dev-secret-key-change-in-production'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    # Third party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.github',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    # Local
    'apps.users',
    'apps.goals',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

ROOT_URLCONF = 'lernzeit.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'lernzeit.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_USER_MODEL = 'users.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

SITE_ID = 1

ACCOUNT_EMAIL_VERIFICATION = 'none'
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False

REST_AUTH = {
    'USE_JWT': False,
    'TOKEN_MODEL': 'rest_framework.authtoken.models.Token',
}

CORS_ALLOW_ALL_ORIGINS = True  # nur für Entwicklung
CORS_ALLOW_CREDENTIALS = True

LANGUAGE_CODE = 'de-de'
TIME_ZONE = 'Europe/Berlin'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
```

- [ ] **Schritt 7: `backend/lernzeit/urls.py` schreiben**

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/social/', include('allauth.socialaccount.urls')),
    path('api/', include('apps.goals.urls')),
    path('api/', include('apps.users.urls')),
]
```

---

### Task 2: User-Modell

**Files:**
- Modify: `backend/apps/users/models.py`
- Modify: `backend/apps/users/serializers.py`
- Modify: `backend/apps/users/views.py`
- Modify: `backend/apps/users/urls.py`
- Create: `backend/apps/users/admin.py`

- [ ] **Schritt 1: `backend/apps/users/models.py` schreiben**

```python
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=100, blank=True)
    avatar_url = models.URLField(blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
```

- [ ] **Schritt 2: `backend/apps/users/serializers.py` schreiben**

```python
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'display_name', 'avatar_url']
        read_only_fields = ['id', 'email']
```

- [ ] **Schritt 3: `backend/apps/users/views.py` schreiben**

```python
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
```

- [ ] **Schritt 4: `backend/apps/users/urls.py` schreiben**

```python
from django.urls import path
from .views import MeView

urlpatterns = [
    path('users/me/', MeView.as_view(), name='me'),
]
```

- [ ] **Schritt 5: `backend/apps/users/admin.py` schreiben**

```python
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

admin.site.register(User, UserAdmin)
```

- [ ] **Schritt 6: `apps/users/apps.py` prüfen – name muss `apps.users` sein**

```python
from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'
```

---

### Task 3: Goals-Modelle

**Files:**
- Modify: `backend/apps/goals/models.py`
- Create: `backend/apps/goals/admin.py`

- [ ] **Schritt 1: `backend/apps/goals/models.py` schreiben**

```python
import uuid
from django.db import models
from django.conf import settings


class Goal(models.Model):
    class Visibility(models.TextChoices):
        PRIVATE = 'PRIVATE', 'Privat'
        SHARED = 'SHARED', 'Geteilt'
        COLLABORATIVE = 'COLLABORATIVE', 'Kollaborativ'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_goals'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    target_hours = models.FloatField(default=0)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    visibility = models.CharField(
        max_length=15, choices=Visibility.choices, default=Visibility.PRIVATE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class GoalMembership(models.Model):
    class Role(models.TextChoices):
        VIEWER = 'VIEWER', 'Betrachter'
        CONTRIBUTOR = 'CONTRIBUTOR', 'Mitwirkender'

    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='goal_memberships'
    )
    role = models.CharField(max_length=15, choices=Role.choices, default=Role.VIEWER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('goal', 'user')

    def __str__(self):
        return f'{self.user} → {self.goal} ({self.role})'


class Plan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='plans')
    weekly_hours = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Plan für {self.goal}: {self.weekly_hours}h/Woche'


class Session(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='sessions')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions'
    )
    started_at = models.DateTimeField()
    duration_seconds = models.IntegerField(default=0)
    note = models.TextField(blank=True)

    def __str__(self):
        return f'Session {self.id} ({self.duration_seconds}s)'


class Milestone(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Offen'
        DONE = 'DONE', 'Erledigt'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='milestones')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='milestones'
    )
    title = models.CharField(max_length=200)
    target_date = models.DateField(null=True, blank=True)
    note = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)

    def __str__(self):
        return self.title
```

- [ ] **Schritt 2: `backend/apps/goals/admin.py` schreiben**

```python
from django.contrib import admin
from .models import Goal, GoalMembership, Plan, Session, Milestone

admin.site.register(Goal)
admin.site.register(GoalMembership)
admin.site.register(Plan)
admin.site.register(Session)
admin.site.register(Milestone)
```

- [ ] **Schritt 3: `apps/goals/apps.py` prüfen – name muss `apps.goals` sein**

```python
from django.apps import AppConfig

class GoalsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.goals'
```

- [ ] **Schritt 4: Migrationen erstellen und anwenden**

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

Erwartete Ausgabe: Tabellen werden erstellt, keine Fehler.

- [ ] **Schritt 5: Superuser anlegen**

```bash
python manage.py createsuperuser --email admin@example.com --username admin
```

---

### Task 4: Goals-Permissions und Serializers

**Files:**
- Create: `backend/apps/goals/permissions.py`
- Modify: `backend/apps/goals/serializers.py`

- [ ] **Schritt 1: `backend/apps/goals/permissions.py` schreiben**

```python
from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Goal, GoalMembership


def get_user_role(goal, user):
    """Gibt die Rolle des Users für ein Ziel zurück oder None."""
    if goal.owner == user:
        return 'OWNER'
    try:
        return goal.memberships.get(user=user).role
    except GoalMembership.DoesNotExist:
        return None


class CanAccessGoal(BasePermission):
    """Lesezugriff: Owner, Member, oder goal ist SHARED/COLLABORATIVE."""
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Goal):
            goal = obj
        else:
            goal = obj.goal

        role = get_user_role(goal, request.user)
        if role:
            return True
        if goal.visibility in ('SHARED', 'COLLABORATIVE') and request.method in SAFE_METHODS:
            return True
        return False


class CanWriteToGoal(BasePermission):
    """Schreibzugriff: Owner oder CONTRIBUTOR."""
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Goal):
            goal = obj
        else:
            goal = obj.goal

        if request.method in SAFE_METHODS:
            return CanAccessGoal().has_object_permission(request, view, obj)

        role = get_user_role(goal, request.user)
        return role in ('OWNER', 'CONTRIBUTOR')


class IsGoalOwner(BasePermission):
    """Nur Owner darf Ziel löschen, umbenennen, Mitglieder verwalten."""
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Goal):
            goal = obj
        else:
            goal = obj.goal
        return goal.owner == request.user
```

- [ ] **Schritt 2: `backend/apps/goals/serializers.py` schreiben**

```python
from rest_framework import serializers
from apps.users.serializers import UserSerializer
from apps.users.models import User
from .models import Goal, GoalMembership, Plan, Session, Milestone


class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        source='user',
        queryset=User.objects.all(),
        write_only=True
    )

    class Meta:
        model = GoalMembership
        fields = ['id', 'user', 'user_id', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ['id', 'weekly_hours', 'created_at']
        read_only_fields = ['id', 'created_at']


class SessionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Session
        fields = ['id', 'user', 'started_at', 'duration_seconds', 'note']
        read_only_fields = ['id', 'user']


class MilestoneSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Milestone
        fields = ['id', 'created_by', 'title', 'target_date', 'note', 'status']
        read_only_fields = ['id', 'created_by']


class GoalSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    memberships = MembershipSerializer(many=True, read_only=True)
    plans = PlanSerializer(many=True, read_only=True)
    milestones = MilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = Goal
        fields = [
            'id', 'owner', 'title', 'description', 'target_hours',
            'start_date', 'end_date', 'visibility', 'created_at',
            'memberships', 'plans', 'milestones',
        ]
        read_only_fields = ['id', 'owner', 'created_at']


class GoalListSerializer(serializers.ModelSerializer):
    """Kompakter Serializer für Listen-Ansicht."""
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Goal
        fields = ['id', 'owner', 'title', 'target_hours', 'start_date', 'end_date', 'visibility', 'created_at']
        read_only_fields = ['id', 'owner', 'created_at']
```

---

### Task 5: Goals-Views und URLs

**Files:**
- Modify: `backend/apps/goals/views.py`
- Modify: `backend/apps/goals/urls.py`

- [ ] **Schritt 1: `backend/apps/goals/views.py` schreiben**

```python
from django.db.models import Q, Sum
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Goal, GoalMembership, Plan, Session, Milestone
from .permissions import CanAccessGoal, CanWriteToGoal, IsGoalOwner, get_user_role
from .serializers import (
    GoalSerializer, GoalListSerializer, MembershipSerializer,
    PlanSerializer, SessionSerializer, MilestoneSerializer,
)


def get_accessible_goals(user):
    return Goal.objects.filter(
        Q(owner=user) |
        Q(memberships__user=user) |
        Q(visibility__in=['SHARED', 'COLLABORATIVE'])
    ).distinct()


class GoalListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return GoalListSerializer
        return GoalSerializer

    def get_queryset(self):
        return get_accessible_goals(self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class GoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated, CanAccessGoal]

    def get_queryset(self):
        return get_accessible_goals(self.request.user)

    def destroy(self, request, *args, **kwargs):
        goal = self.get_object()
        if goal.owner != request.user:
            return Response({'detail': 'Nur der Owner kann ein Ziel löschen.'}, status=403)
        return super().destroy(request, *args, **kwargs)


class MemberListCreateView(generics.ListCreateAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_goal(self):
        return generics.get_object_or_404(Goal, pk=self.kwargs['goal_id'])

    def get_queryset(self):
        return GoalMembership.objects.filter(goal=self.get_goal())

    def perform_create(self, serializer):
        goal = self.get_goal()
        if goal.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Nur der Owner kann Mitglieder einladen.')
        serializer.save(goal=goal)


class MemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GoalMembership.objects.filter(goal__pk=self.kwargs['goal_id'])

    def get_object(self):
        return generics.get_object_or_404(
            self.get_queryset(), user__pk=self.kwargs['user_id']
        )


class SessionListCreateView(generics.ListCreateAPIView):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_goal(self):
        return generics.get_object_or_404(Goal, pk=self.kwargs['goal_id'])

    def get_queryset(self):
        goal = self.get_goal()
        role = get_user_role(goal, self.request.user)
        if goal.visibility == 'PRIVATE' and not role:
            return Session.objects.none()
        if goal.visibility == 'COLLABORATIVE':
            return Session.objects.filter(goal=goal)
        return Session.objects.filter(goal=goal, user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(goal=self.get_goal(), user=self.request.user)


class MilestoneListCreateView(generics.ListCreateAPIView):
    serializer_class = MilestoneSerializer
    permission_classes = [IsAuthenticated]

    def get_goal(self):
        return generics.get_object_or_404(Goal, pk=self.kwargs['goal_id'])

    def get_queryset(self):
        return Milestone.objects.filter(goal=self.get_goal())

    def perform_create(self, serializer):
        serializer.save(goal=self.get_goal(), created_by=self.request.user)


class MilestoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MilestoneSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Milestone.objects.filter(goal__pk=self.kwargs['goal_id'])


class PlanListCreateView(generics.ListCreateAPIView):
    serializer_class = PlanSerializer
    permission_classes = [IsAuthenticated]

    def get_goal(self):
        return generics.get_object_or_404(Goal, pk=self.kwargs['goal_id'])

    def get_queryset(self):
        return Plan.objects.filter(goal=self.get_goal())

    def perform_create(self, serializer):
        serializer.save(goal=self.get_goal())


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def goal_stats(request, goal_id):
    goal = generics.get_object_or_404(Goal, pk=goal_id)
    sessions = Session.objects.filter(goal=goal)

    own_seconds = sessions.filter(user=request.user).aggregate(
        total=Sum('duration_seconds')
    )['total'] or 0

    total_seconds = sessions.aggregate(total=Sum('duration_seconds'))['total'] or 0

    return Response({
        'goal_id': str(goal.id),
        'own_hours': round(own_seconds / 3600, 2),
        'total_hours': round(total_seconds / 3600, 2),
        'target_hours': goal.target_hours,
        'progress_percent': round((own_seconds / 3600) / goal.target_hours * 100, 1) if goal.target_hours else 0,
        'session_count': sessions.filter(user=request.user).count(),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    goals = get_accessible_goals(request.user)
    result = []
    for goal in goals:
        sessions = Session.objects.filter(goal=goal, user=request.user)
        own_seconds = sessions.aggregate(total=Sum('duration_seconds'))['total'] or 0
        result.append({
            'id': str(goal.id),
            'title': goal.title,
            'visibility': goal.visibility,
            'own_hours': round(own_seconds / 3600, 2),
            'target_hours': goal.target_hours,
            'progress_percent': round((own_seconds / 3600) / goal.target_hours * 100, 1) if goal.target_hours else 0,
            'open_milestones': goal.milestones.filter(status='OPEN').count(),
        })
    return Response(result)
```

- [ ] **Schritt 2: `backend/apps/goals/urls.py` schreiben**

```python
from django.urls import path
from . import views

urlpatterns = [
    path('goals/', views.GoalListCreateView.as_view(), name='goal-list'),
    path('goals/<uuid:pk>/', views.GoalDetailView.as_view(), name='goal-detail'),
    path('goals/<uuid:goal_id>/members/', views.MemberListCreateView.as_view(), name='member-list'),
    path('goals/<uuid:goal_id>/members/<int:user_id>/', views.MemberDetailView.as_view(), name='member-detail'),
    path('goals/<uuid:goal_id>/sessions/', views.SessionListCreateView.as_view(), name='session-list'),
    path('goals/<uuid:goal_id>/milestones/', views.MilestoneListCreateView.as_view(), name='milestone-list'),
    path('goals/<uuid:goal_id>/milestones/<uuid:pk>/', views.MilestoneDetailView.as_view(), name='milestone-detail'),
    path('goals/<uuid:goal_id>/plans/', views.PlanListCreateView.as_view(), name='plan-list'),
    path('goals/<uuid:goal_id>/stats/', views.goal_stats, name='goal-stats'),
    path('dashboard/', views.dashboard, name='dashboard'),
]
```

---

### Task 6: Server starten und API prüfen

**Files:** keine neuen

- [ ] **Schritt 1: Development-Server starten**

```bash
cd backend
source .venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

Erwartete Ausgabe: `Starting development server at http://0.0.0.0:8000/`

- [ ] **Schritt 2: Admin-Interface prüfen**

Browser öffnen: `http://localhost:8000/admin/` → Login mit dem Superuser-Account.
Goals, Sessions, Milestones sollen in der Admin-Sidebar erscheinen.

- [ ] **Schritt 3: Registrierung per curl testen**

```bash
curl -X POST http://localhost:8000/api/auth/registration/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password1":"testpass123!","password2":"testpass123!"}'
```

Erwartete Antwort: `{"key": "<token>"}` oder ähnlich mit Auth-Token.

- [ ] **Schritt 4: Login testen**

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123!"}'
```

Token aus der Antwort merken, z.B.: `export TOKEN=<token>`

- [ ] **Schritt 5: Goal erstellen**

```bash
curl -X POST http://localhost:8000/api/goals/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Python lernen","target_hours":50,"visibility":"PRIVATE"}'
```

Erwartete Antwort: Goal-Objekt mit UUID.

- [ ] **Schritt 6: Dashboard abrufen**

```bash
curl http://localhost:8000/api/dashboard/ \
  -H "Authorization: Token $TOKEN"
```

Erwartete Antwort: Liste mit einem Ziel und `progress_percent: 0`.

---

### Task 7: Bestehende Logik nach Backend migrieren

**Files:**
- Copy: `src/logic/` → `backend/src/logic/`
- Copy: `src/types/` → `backend/src/types/`

- [ ] **Schritt 1: Logik-Module kopieren**

```bash
cp -r src/logic backend/src/
cp -r src/types backend/src/
touch backend/src/__init__.py
```

- [ ] **Schritt 2: Import-Pfade in stats-View prüfen**

Die bestehenden Funktionen aus `src/logic/statistics.py` und `src/logic/planning.py` können in den Views optional genutzt werden. Kein zwingender Schritt – die Django-Views berechnen Stats direkt per ORM. Die Logik-Module stehen aber für spätere Erweiterungen bereit.
