"""
Automated tests for Dream Share API.

Run tests with:
    pytest -v
    
Run with coverage:
    coverage run -m pytest
    coverage report
"""

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.utils import timezone
from io import BytesIO
from PIL import Image

from core.models import (
    Usuario, Publicacao, Comentario, Seguidor, 
    ReacaoPublicacao, Notificacao
)
from core.factories import (
    UsuarioFactory, PublicacaoFactory, ComentarioFactory,
    SeguidorFactory, ReacaoPublicacaoFactory
)


# Fixtures
@pytest.fixture
def api_client():
    """Returns an API client for making requests"""
    return APIClient()


@pytest.fixture
def user(db):
    """Creates and returns a test user"""
    return UsuarioFactory(password='TestPass123!')


@pytest.fixture
def authenticated_client(api_client, user):
    """Returns an authenticated API client using force_authenticate to bypass rate limiting"""
    api_client.force_authenticate(user=user)
    return api_client



@pytest.fixture
def other_user(db):
    """Creates and returns another test user"""
    return UsuarioFactory(password='OtherPass123!')


@pytest.fixture
def public_dream(db, user):
    """Creates a public dream post"""
    return PublicacaoFactory(usuario=user, visibilidade=1)


# ==================== Auth Tests ====================

@pytest.mark.django_db
class TestAuth:
    """Tests for authentication endpoints"""
    
    def test_user_registration_success(self, api_client):
        """Test successful user registration"""
        data = {
            'nome_usuario': 'newuser',
            'email': 'newuser@test.com',
            'nome_completo': 'New User',
            'password': 'SecurePass123!'
        }
        response = api_client.post('/api/auth/register/', data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Usuario.objects.filter(email='newuser@test.com').exists()
    
    def test_user_registration_duplicate_email(self, api_client, user):
        """Test registration with duplicate email fails"""
        data = {
            'nome_usuario': 'anotheruser',
            'email': user.email,  # Using existing user's email
            'nome_completo': 'Another User',
            'password': 'SecurePass123!'
        }
        response = api_client.post('/api/auth/register/', data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_user_login_success(self, api_client, user):
        """Test successful login"""
        response = api_client.post(
            '/api/auth/login/',
            {'email': user.email, 'password': 'TestPass123!'},
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
    
    def test_user_login_invalid_credentials(self, api_client, user):
        """Test login with invalid credentials fails"""
        response = api_client.post(
            '/api/auth/login/',
            {'email': user.email, 'password': 'WrongPassword!'},
            format='json'
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_user_logout_success(self, authenticated_client, api_client, user):
        """Test successful logout"""
        # First login to get refresh token
        login_response = api_client.post(
            '/api/auth/login/',
            {'email': user.email, 'password': 'TestPass123!'},
            format='json'
        )
        refresh_token = login_response.data['refresh']
        
        # Then logout
        response = authenticated_client.post(
            '/api/auth/logout/',
            {'refresh': refresh_token},
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_token_refresh(self, api_client, user):
        """Test token refresh works"""
        # Login first
        login_response = api_client.post(
            '/api/auth/login/',
            {'email': user.email, 'password': 'TestPass123!'},
            format='json'
        )
        refresh_token = login_response.data['refresh']
        
        # Refresh the token
        response = api_client.post(
            '/api/auth/refresh/',
            {'refresh': refresh_token},
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data


# ==================== Profile Tests ====================

@pytest.mark.django_db
class TestProfile:
    """Tests for user profile endpoints"""
    
    def test_get_own_profile(self, authenticated_client, user):
        """Test getting own profile"""
        response = authenticated_client.get('/api/profile/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == user.email
        assert response.data['nome_usuario'] == user.nome_usuario
    
    def test_update_own_profile(self, authenticated_client, user):
        """Test updating own profile"""
        response = authenticated_client.put(
            f'/api/users/{user.id_usuario}/',
            {'bio': 'Updated bio!'},
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.bio == 'Updated bio!'
    
    def test_cannot_update_other_profile(self, authenticated_client, other_user):
        """Test that user cannot update another user's profile"""
        response = authenticated_client.put(
            f'/api/users/{other_user.id_usuario}/',
            {'bio': 'Hacked bio!'},
            format='json'
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_avatar_upload(self, authenticated_client):
        """Test avatar upload"""
        # Create a test image
        image = Image.new('RGB', (100, 100), color='red')
        image_io = BytesIO()
        image.save(image_io, format='JPEG')
        image_io.seek(0)
        image_io.name = 'test_avatar.jpg'
        
        response = authenticated_client.post(
            '/api/users/avatar/',
            {'avatar': image_io},
            format='multipart'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert 'avatar_url' in response.data


# ==================== Dreams Tests ====================

@pytest.mark.django_db
class TestDreams:
    """Tests for dream (publicacao) endpoints"""
    
    def test_create_dream_success(self, authenticated_client):
        """Test creating a dream post"""
        data = {
            'titulo': 'My Dream',
            'conteudo_texto': 'I dreamed about flying over mountains #sonholucido #voar',
            'tipo_sonho': 'Lúcido',
            'visibilidade': 1
        }
        response = authenticated_client.post('/api/dreams/', data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Publicacao.objects.filter(titulo='My Dream').exists()
    
    def test_create_dream_with_image(self, authenticated_client):
        """Test creating a dream with an image"""
        image = Image.new('RGB', (100, 100), color='blue')
        image_io = BytesIO()
        image.save(image_io, format='PNG')
        image_io.seek(0)
        image_io.name = 'dream.png'
        
        data = {
            'conteudo_texto': 'Dream with image',
            'visibilidade': 1,
            'imagem': image_io
        }
        response = authenticated_client.post('/api/dreams/', data, format='multipart')
        
        assert response.status_code == status.HTTP_201_CREATED
    
    def test_list_dreams_following(self, authenticated_client, user, other_user):
        """Test listing dreams from followed users"""
        # Create a follow relationship
        Seguidor.objects.create(usuario_seguidor=user, usuario_seguido=other_user, status=1)
        
        # Create a dream by other_user
        PublicacaoFactory(usuario=other_user, visibilidade=1)
        
        response = authenticated_client.get('/api/dreams/?tab=following')
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_list_dreams_foryou(self, authenticated_client, public_dream):
        """Test listing dreams in For You feed"""
        response = authenticated_client.get('/api/dreams/?tab=foryou')
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_update_own_dream(self, authenticated_client, user):
        """Test updating own dream"""
        dream = PublicacaoFactory(usuario=user)
        
        response = authenticated_client.patch(
            f'/api/dreams/{dream.id_publicacao}/',
            {'titulo': 'Updated Title'},
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        dream.refresh_from_db()
        assert dream.titulo == 'Updated Title'
    
    def test_delete_own_dream(self, authenticated_client, user):
        """Test deleting own dream"""
        dream = PublicacaoFactory(usuario=user)
        dream_id = dream.id_publicacao
        
        response = authenticated_client.delete(f'/api/dreams/{dream_id}/')
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Publicacao.objects.filter(id_publicacao=dream_id).exists()
    
    def test_cannot_update_other_dream(self, authenticated_client, other_user):
        """Test that user cannot update another user's dream"""
        dream = PublicacaoFactory(usuario=other_user)
        
        response = authenticated_client.patch(
            f'/api/dreams/{dream.id_publicacao}/',
            {'titulo': 'Hacked Title'},
            format='json'
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_like_dream_toggle(self, authenticated_client, public_dream):
        """Test liking and unliking a dream"""
        # Like
        response = authenticated_client.post(f'/api/dreams/{public_dream.id_publicacao}/like/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_liked'] == True
        assert response.data['likes_count'] == 1
        
        # Unlike
        response = authenticated_client.post(f'/api/dreams/{public_dream.id_publicacao}/like/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_liked'] == False
        assert response.data['likes_count'] == 0


# ==================== Comments Tests ====================

@pytest.mark.django_db
class TestComments:
    """Tests for comment endpoints"""
    
    def test_create_comment(self, authenticated_client, public_dream):
        """Test creating a comment on a dream"""
        response = authenticated_client.post(
            f'/api/dreams/{public_dream.id_publicacao}/comments/',
            {'conteudo_texto': 'Great dream!'},
            format='json'
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Comentario.objects.filter(publicacao=public_dream).exists()
    
    def test_list_comments(self, authenticated_client, public_dream):
        """Test listing comments on a dream"""
        ComentarioFactory(publicacao=public_dream)
        ComentarioFactory(publicacao=public_dream)
        
        response = authenticated_client.get(f'/api/dreams/{public_dream.id_publicacao}/comments/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 2
    
    def test_delete_own_comment(self, authenticated_client, user, public_dream):
        """Test deleting own comment"""
        comment = ComentarioFactory(publicacao=public_dream, usuario=user)
        
        response = authenticated_client.delete(
            f'/api/dreams/{public_dream.id_publicacao}/comments/{comment.id_comentario}/'
        )
        
        assert response.status_code == status.HTTP_204_NO_CONTENT


# ==================== Follow Tests ====================

@pytest.mark.django_db
class TestFollow:
    """Tests for follow/unfollow endpoints"""
    
    def test_follow_user(self, authenticated_client, other_user):
        """Test following a user"""
        response = authenticated_client.post(f'/api/users/{other_user.id_usuario}/follow/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_following'] == True
    
    def test_unfollow_user(self, authenticated_client, user, other_user):
        """Test unfollowing a user"""
        # First follow
        Seguidor.objects.create(usuario_seguidor=user, usuario_seguido=other_user, status=1)
        
        response = authenticated_client.delete(f'/api/users/{other_user.id_usuario}/follow/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_following'] == False
    
    def test_cannot_follow_self(self, authenticated_client, user):
        """Test that user cannot follow themselves"""
        response = authenticated_client.post(f'/api/users/{user.id_usuario}/follow/')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_suggested_users(self, authenticated_client, other_user):
        """Test getting suggested users"""
        response = authenticated_client.get('/api/users/suggested/')
        
        assert response.status_code == status.HTTP_200_OK


# ==================== Notifications Tests ====================

@pytest.mark.django_db
class TestNotifications:
    """Tests for notification endpoints"""
    
    def test_notification_on_like(self, authenticated_client, other_user):
        """Test that liking creates a notification"""
        dream = PublicacaoFactory(usuario=other_user, visibilidade=1)
        
        response = authenticated_client.post(f'/api/dreams/{dream.id_publicacao}/like/')
        assert response.status_code == status.HTTP_200_OK, f"Like failed with status {response.status_code}"
        
        # Check if notification was created
        assert Notificacao.objects.filter(
            usuario_destino=other_user,
            tipo_notificacao=3  # Like
        ).exists()

    
    def test_notification_on_comment(self, authenticated_client, other_user):
        """Test that commenting creates a notification"""
        dream = PublicacaoFactory(usuario=other_user, visibilidade=1)
        
        authenticated_client.post(
            f'/api/dreams/{dream.id_publicacao}/comments/',
            {'conteudo_texto': 'Nice dream!'},
            format='json'
        )
        
        # Check if notification was created
        assert Notificacao.objects.filter(
            usuario_destino=other_user,
            tipo_notificacao=2  # Comment
        ).exists()
    
    def test_notification_on_follow(self, authenticated_client, other_user):
        """Test that following creates a notification"""
        authenticated_client.post(f'/api/users/{other_user.id_usuario}/follow/')
        
        # Check if notification was created
        assert Notificacao.objects.filter(
            usuario_destino=other_user,
            tipo_notificacao=4  # Follow
        ).exists()
    
    def test_mark_notification_read(self, authenticated_client, user, other_user):
        """Test marking a notification as read"""
        notification = Notificacao.objects.create(
            usuario_destino=user,
            usuario_origem=other_user,
            tipo_notificacao=3,
            conteudo='Test notification'
        )
        
        response = authenticated_client.patch(
            f'/api/notifications/{notification.id_notificacao}/read/'
        )
        
        assert response.status_code == status.HTTP_200_OK
        notification.refresh_from_db()
        assert notification.lida == True


# ==================== Search Tests ====================

@pytest.mark.django_db
class TestSearch:
    """Tests for search endpoint"""
    
    def test_search_posts(self, authenticated_client, user):
        """Test searching for posts"""
        PublicacaoFactory(usuario=user, conteudo_texto='Flying over mountains', visibilidade=1)
        
        response = authenticated_client.get('/api/search/?q=flying&type=posts')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert 'counts' in response.data
    
    def test_search_users(self, authenticated_client, other_user):
        """Test searching for users"""
        response = authenticated_client.get(f'/api/search/?q={other_user.nome_usuario[:4]}&type=users')
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_search_requires_query(self, authenticated_client):
        """Test that search requires a query parameter"""
        response = authenticated_client.get('/api/search/')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
