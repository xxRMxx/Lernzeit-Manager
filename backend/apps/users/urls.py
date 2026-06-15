from django.urls import path
from .views import (
    MeView,
    ChangePasswordView,
    ChangeEmailView,
    DeleteAccountView,
    UserPreferencesView,
    AdminUserListView,
    AdminUserDetailView,
    AdminResetPasswordView,
)

urlpatterns = [
    path('users/me/', MeView.as_view(), name='me'),
    path('users/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('users/change-email/', ChangeEmailView.as_view(), name='change-email'),
    path('users/delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    path('users/preferences/', UserPreferencesView.as_view(), name='user-preferences'),
    # Admin endpoints
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:pk>/reset-password/', AdminResetPasswordView.as_view(), name='admin-reset-password'),
]
