from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserPreferencesSerializer
from .models import UserPreferences

User = get_user_model()


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    """Change the user's password."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response(
                {'error': 'old_password und new_password sind erforderlich.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(old_password):
            return Response(
                {'error': 'Das alte Passwort ist falsch.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {'error': 'Das neue Passwort muss mindestens 8 Zeichen lang sein.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response({'success': 'Passwort erfolgreich geändert.'})


class ChangeEmailView(generics.GenericAPIView):
    """Change the user's email address."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        new_email = request.data.get('new_email')
        password = request.data.get('password')

        if not new_email or not password:
            return Response(
                {'error': 'new_email und password sind erforderlich.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(password):
            return Response(
                {'error': 'Passwort ist falsch.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=new_email).exclude(pk=user.pk).exists():
            return Response(
                {'error': 'Diese E-Mail-Adresse wird bereits verwendet.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.email = new_email
        user.save()
        return Response({'success': 'E-Mail-Adresse erfolgreich geändert.'})


class DeleteAccountView(generics.GenericAPIView):
    """Delete the user's account."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        password = request.data.get('password')

        if not password:
            return Response(
                {'error': 'password ist erforderlich.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(password):
            return Response(
                {'error': 'Passwort ist falsch.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.delete()
        return Response({'success': 'Account erfolgreich gelöscht.'})


class UserPreferencesView(generics.RetrieveUpdateAPIView):
    """Get or update user preferences."""
    serializer_class = UserPreferencesSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        preferences, created = UserPreferences.objects.get_or_create(user=self.request.user)
        return preferences
