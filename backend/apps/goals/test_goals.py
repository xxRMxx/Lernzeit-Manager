from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from .models import Goal, Session

User = get_user_model()

class GoalStatsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Custom user model using email
        self.user = User.objects.create(email='test@example.com')
        self.user.set_password('testpassword')
        self.user.save()
        self.other_user = User.objects.create(email='other@example.com')
        self.other_user.set_password('testpassword')
        self.other_user.save()

        self.goal = Goal.objects.create(owner=self.user, title='Test Goal', target_hours=10)
        self.url = f'/api/goals/{self.goal.id}/stats/'

    def test_goal_stats_unauthenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_goal_stats_authenticated(self):
        self.client.force_authenticate(user=self.user)
        Session.objects.create(goal=self.goal, user=self.user, started_at='2024-01-01T10:00:00Z', duration_seconds=3600)
        Session.objects.create(goal=self.goal, user=self.other_user, started_at='2024-01-01T10:00:00Z', duration_seconds=7200)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertEqual(data['goal_id'], str(self.goal.id))
        self.assertEqual(data['own_hours'], 1.0)
        self.assertEqual(data['total_hours'], 3.0)
        self.assertEqual(data['target_hours'], 10.0)
        self.assertEqual(data['progress_percent'], 10.0)
        self.assertEqual(data['session_count'], 1)

    def test_goal_stats_empty(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertEqual(data['own_hours'], 0.0)
        self.assertEqual(data['total_hours'], 0.0)
        self.assertEqual(data['session_count'], 0)
