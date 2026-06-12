from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.goals.models import Goal, Session

User = get_user_model()

class GoalIntegrationTests(APITestCase):
    def setUp(self):
        # Create users directly to bypass default UserManager username parameter requirement
        self.user1 = User(
            email='alice@example.com', display_name='Alice'
        )
        self.user1.set_password('password123')
        self.user1.save()

        self.user2 = User(
            email='bob@example.com', display_name='Bob'
        )
        self.user2.set_password('password123')
        self.user2.save()
        
        # Create a private goal for Alice
        self.goal_private = Goal.objects.create(
            owner=self.user1,
            title='Alice Private Goal',
            description='Study math',
            target_hours=50.0,
            visibility=Goal.Visibility.PRIVATE
        )
        
        # Create a shared goal for Alice
        self.goal_shared = Goal.objects.create(
            owner=self.user1,
            title='Alice Shared Goal',
            description='Physics research',
            target_hours=100.0,
            visibility=Goal.Visibility.SHARED
        )

    def test_create_goal_authenticated(self):
        """Verify that an authenticated user can create a goal."""
        self.client.force_authenticate(user=self.user1)
        url = reverse('goal-list')
        data = {
            'title': 'New Goal',
            'description': 'Chemistry study',
            'target_hours': 20.0,
            'visibility': 'PRIVATE'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Goal')
        self.assertEqual(response.data['owner']['email'], self.user1.email)

    def test_anonymous_cannot_access_goals(self):
        """Verify that anonymous users cannot view goals."""
        url = reverse('goal-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_private_goal_permissions(self):
        """Verify that only the owner can access a private goal (others get 404)."""
        # Alice can access her private goal
        self.client.force_authenticate(user=self.user1)
        url = reverse('goal-detail', kwargs={'pk': self.goal_private.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Bob gets a 404 Not Found when trying to access Alice's private goal
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_shared_goal_permissions_safe_methods(self):
        """Verify that other users can read a shared goal but not write to it."""
        # Bob can read Alice's shared goal
        self.client.force_authenticate(user=self.user2)
        url = reverse('goal-detail', kwargs={'pk': self.goal_shared.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Bob cannot update Alice's shared goal
        data = {'title': 'Bob updated this'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_and_delete_session(self):
        """Verify session tracking integration."""
        self.client.force_authenticate(user=self.user1)
        url = reverse('session-list', kwargs={'goal_id': self.goal_private.id})
        
        data = {
            'started_at': timezone.now().isoformat(),
            'duration_seconds': 3600,
            'note': 'Calculus study'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        session_id = response.data['id']
        
        # Delete the session
        detail_url = reverse('session-detail', kwargs={'goal_id': self.goal_private.id, 'pk': session_id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Session.objects.filter(id=session_id).exists())
