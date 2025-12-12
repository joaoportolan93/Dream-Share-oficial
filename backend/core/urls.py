from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, UserProfileView, UserDetailView, LogoutView, AvatarUploadView, PublicacaoViewSet

# Router for ViewSets
router = DefaultRouter()
router.register(r'dreams', PublicacaoViewSet, basename='dreams')

urlpatterns = [
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    
    # User endpoints
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
    path('users/avatar/', AvatarUploadView.as_view(), name='avatar_upload'),
    
    # Include router URLs (dreams CRUD)
    path('', include(router.urls)),
]
