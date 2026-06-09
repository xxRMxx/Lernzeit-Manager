from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import User, UserPreferences


class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = ['learning_reminders_enabled', 'weekly_report_enabled']


class UserSerializer(serializers.ModelSerializer):
    preferences = UserPreferencesSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'display_name', 'avatar_url', 'preferences']
        read_only_fields = ['id', 'email']


class CustomRegisterSerializer(RegisterSerializer):
    username = None

    def validate_email(self, email):
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.")
        return email

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data.pop('username', None)
        return data
