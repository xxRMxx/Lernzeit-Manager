from django.urls import path
from .views import (
    MeView,
    ChangePasswordView,
    ChangeEmailView,
    DeleteAccountView,
    UserPreferencesView,
)

urlpatterns = [
    path('users/me/', MeView.as_view(), name='me'),
    path('users/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('users/change-email/', ChangeEmailView.as_view(), name='change-email'),
    path('users/delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    path('users/preferences/', UserPreferencesView.as_view(), name='user-preferences'),
]
