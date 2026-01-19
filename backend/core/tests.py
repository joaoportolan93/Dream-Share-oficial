import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from .factories import UsuarioFactory, PublicacaoFactory, ComentarioFactory
from .models import Usuario, Publicacao, Seguidor, Notificacao

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user():
    return UsuarioFactory()

@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client

@pytest.mark.django_db
class TestAuth:
    def test_user_registration_success(self, api_client):
        url = reverse('register')
        data = {
            'nome_usuario': 'newuser',
            'email': 'new@example.com',
            'nome_completo': 'New User',
            'password': 'password123'
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Usuario.objects.filter(email='new@example.com').exists()

    def test_user_registration_duplicate_email(self, api_client, user):
        url = reverse('register')
        data = {
            'nome_usuario': 'otheruser',
            'email': user.email,
            'nome_completo': 'Other User',
            'password': 'password123'
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_user_login_success(self, api_client, user):
        url = reverse('token_obtain_pair')
        data = {
            'email': user.email,
            'password': 'password123'
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

@pytest.mark.django_db
class TestProfile:
    def test_get_own_profile(self, auth_client, user):
        url = reverse('profile')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == user.email

    def test_update_own_profile(self, auth_client, user):
        url = reverse('user_detail', args=[user.id_usuario])
        data = {'nome_completo': 'Updated Name'}
        response = auth_client.put(url, data)
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.nome_completo == 'Updated Name'

@pytest.mark.django_db
class TestDreams:
    def test_create_dream_success(self, auth_client):
        url = reverse('dreams-list')
        data = {
            'titulo': 'My Dream',
            'conteudo_texto': 'I was flying #flying',
            'visibilidade': 1
        }
        response = auth_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Publicacao.objects.count() == 1
        # Check hashtag extraction
        assert 'flying' in response.data['conteudo_texto']

    def test_list_dreams_foryou(self, auth_client):
        # Create public dreams
        PublicacaoFactory.create_batch(3, visibilidade=1)
        # Create private dream
        PublicacaoFactory(visibilidade=3)
        
        url = reverse('dreams-list') + '?tab=foryou'
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3

    def test_like_dream_toggle(self, auth_client, user):
        dream = PublicacaoFactory()
        url = reverse('dreams-like', args=[dream.id_publicacao])
        
        # Like
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_liked'] is True
        
        # Unlike
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_liked'] is False

@pytest.mark.django_db
class TestComments:
    def test_create_comment(self, auth_client):
        dream = PublicacaoFactory()
        url = reverse('dream-comments-list', args=[dream.id_publicacao])
        data = {'conteudo_texto': 'Nice dream!'}
        
        response = auth_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert dream.comentario_set.count() == 1

@pytest.mark.django_db
class TestFollow:
    def test_follow_user(self, auth_client, user):
        other_user = UsuarioFactory()
        url = reverse('follow', args=[other_user.id_usuario])
        
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert Seguidor.objects.filter(usuario_seguidor=user, usuario_seguido=other_user).exists()
        
        # Check notification
        assert Notificacao.objects.filter(usuario_destino=other_user, tipo_notificacao=4).exists()

    def test_cannot_follow_self(self, auth_client, user):
        url = reverse('follow', args=[user.id_usuario])
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
class TestSearch:
    def test_search_posts(self, auth_client):
        PublicacaoFactory(titulo="Flying Dream", conteudo_texto="Sky")
        PublicacaoFactory(titulo="Running Dream", conteudo_texto="Ground")
        
        url = reverse('search') + '?q=Flying'
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']['posts']) == 1
        assert response.data['results']['posts'][0]['titulo'] == "Flying Dream"


@pytest.mark.django_db
class TestSettings:
    def test_get_settings_creates_if_missing(self, auth_client, user):
        """Settings should be auto-created if missing"""
        url = reverse('user-settings')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'notificacoes_novas_publicacoes' in response.data
        assert 'tema_interface' in response.data
        
    def test_update_settings(self, auth_client, user):
        """Settings should be updateable via PATCH"""
        url = reverse('user-settings')
        data = {'tema_interface': 2, 'notificacoes_comentarios': False}
        response = auth_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['tema_interface'] == 2
        assert response.data['notificacoes_comentarios'] is False


@pytest.mark.django_db
class TestCloseFriends:
    def test_list_followers_for_management(self, auth_client, user):
        """Should list followers with close friend status"""
        # Create a follower
        follower = UsuarioFactory()
        Seguidor.objects.create(usuario_seguidor=follower, usuario_seguido=user)
        
        url = reverse('close-friends-manage')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['nome_usuario'] == follower.nome_usuario
        assert response.data[0]['is_close_friend'] is False
        
    def test_toggle_close_friend(self, auth_client, user):
        """Should toggle close friend status"""
        # Create a follower
        follower = UsuarioFactory()
        Seguidor.objects.create(usuario_seguidor=follower, usuario_seguido=user)
        
        url = reverse('close-friends-toggle', args=[follower.id_usuario])
        
        # Toggle ON
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_close_friend'] is True
        
        # Toggle OFF
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_close_friend'] is False

