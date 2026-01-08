from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, UserProfileView, UserDetailView, LogoutView, AvatarUploadView, PublicacaoViewSet, FollowView, SuggestedUsersView, ComentarioViewSet, NotificacaoViewSet, SearchView

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
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
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
    
    # Include router URLs (dreams CRUD + notifications)
    path('', include(router.urls)),
]


