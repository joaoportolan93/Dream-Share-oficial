from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, UserProfileView, UserDetailView, LogoutView, 
    AvatarUploadView, PublicacaoViewSet, FollowView, SuggestedUsersView, 
    ComentarioViewSet, NotificacaoViewSet, SearchView, CustomTokenObtainPairView,
    AdminStatsView, AdminUsersView, AdminUserDetailView, AdminReportsView, AdminReportActionView,
    CreateReportView, UserSettingsView, CloseFriendsManagerView, ToggleCloseFriendView
)

# Router for ViewSets
router = DefaultRouter()
router.register(r'dreams', PublicacaoViewSet, basename='dreams')
router.register(r'notifications', NotificacaoViewSet, basename='notifications')

# Nested router for comments
comments_list = ComentarioViewSet.as_view({'get': 'list', 'post': 'create'})
comments_detail = ComentarioViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})

urlpatterns = [
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    
    # User endpoints
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('users/suggested/', SuggestedUsersView.as_view(), name='suggested_users'),
    path('search/', SearchView.as_view(), name='search'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
    path('users/avatar/', AvatarUploadView.as_view(), name='avatar_upload'),
    
    # Follow endpoints
    path('users/<int:pk>/follow/', FollowView.as_view(), name='follow'),
    
    # Comments endpoints (nested under dreams)
    path('dreams/<int:dream_pk>/comments/', comments_list, name='dream-comments-list'),
    path('dreams/<int:dream_pk>/comments/<int:pk>/', comments_detail, name='dream-comments-detail'),
    
    # Admin endpoints - Issue #29
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/users/', AdminUsersView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/reports/', AdminReportsView.as_view(), name='admin-reports'),
    path('admin/reports/<int:pk>/action/', AdminReportActionView.as_view(), name='admin-report-action'),
    
    # User reports
    path('denuncias/', CreateReportView.as_view(), name='create-report'),
    
    # Settings and Close Friends endpoints
    path('settings/', UserSettingsView.as_view(), name='user-settings'),
    path('friends/manage/', CloseFriendsManagerView.as_view(), name='close-friends-manage'),
    path('friends/toggle/<int:pk>/', ToggleCloseFriendView.as_view(), name='close-friends-toggle'),
    
    # Include router URLs (dreams CRUD + notifications)
    path('', include(router.urls)),
]
