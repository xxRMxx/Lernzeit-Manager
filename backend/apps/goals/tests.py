<<<<<<< HEAD
# Create your tests here.
=======
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.goals.models import Goal, GoalMembership
from apps.goals.permissions import get_user_role

User = get_user_model()

class PermissionsTestCase(TestCase):
    def setUp(self):
        self.owner = User.objects.create(email="owner@example.com", password="password")
        self.user_member = User.objects.create(email="member@example.com", password="password")
        self.user_non_member = User.objects.create(email="nonmember@example.com", password="password")

        self.goal = Goal.objects.create(owner=self.owner, title="Test Goal")
        GoalMembership.objects.create(goal=self.goal, user=self.user_member, role='VIEWER')

    def test_get_user_role_owner(self):
        role = get_user_role(self.goal, self.owner)
        self.assertEqual(role, 'OWNER')

    def test_get_user_role_member(self):
        role = get_user_role(self.goal, self.user_member)
        self.assertEqual(role, 'VIEWER')

    def test_get_user_role_non_member(self):
        role = get_user_role(self.goal, self.user_non_member)
        self.assertIsNone(role)
>>>>>>> origin/consolidated/perf-optimizations
