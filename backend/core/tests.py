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
    
    def test_delete_comment_without_replies(self, auth_client, user):
        """Test that comments without replies can be deleted"""
        dream = PublicacaoFactory(usuario=user)
        comment = ComentarioFactory(publicacao=dream, usuario=user)
        url = reverse('dream-comments-detail', args=[dream.id_publicacao, comment.id_comentario])
        
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not dream.comentario_set.filter(id_comentario=comment.id_comentario).exists()
    
    def test_cannot_delete_comment_with_replies(self, auth_client, user):
        """Test that comments with replies cannot be deleted to preserve thread structure"""
        dream = PublicacaoFactory(usuario=user)
        parent_comment = ComentarioFactory(publicacao=dream, usuario=user)
        # Create a reply to the parent comment
        reply = ComentarioFactory(publicacao=dream, usuario=user, comentario_pai=parent_comment)
        
        url = reverse('dream-comments-detail', args=[dream.id_publicacao, parent_comment.id_comentario])
        response = auth_client.delete(url)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'respostas' in response.data['error'].lower()
        # Verify comment still exists
        assert dream.comentario_set.filter(id_comentario=parent_comment.id_comentario).exists()
    
    def test_can_delete_reply_then_parent(self, auth_client, user):
        """Test that replies can be deleted first, then the parent comment"""
        dream = PublicacaoFactory(usuario=user)
        parent_comment = ComentarioFactory(publicacao=dream, usuario=user)
        reply = ComentarioFactory(publicacao=dream, usuario=user, comentario_pai=parent_comment)
        
        # First, delete the reply
        reply_url = reverse('dream-comments-detail', args=[dream.id_publicacao, reply.id_comentario])
        response = auth_client.delete(reply_url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Now, delete the parent (should succeed since reply is gone)
        parent_url = reverse('dream-comments-detail', args=[dream.id_publicacao, parent_comment.id_comentario])
        response = auth_client.delete(parent_url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify both are deleted
        assert dream.comentario_set.filter(status=1).count() == 0
        assert not dream.comentario_set.filter(id_comentario=parent_comment.id_comentario).exists()
        assert not dream.comentario_set.filter(id_comentario=reply.id_comentario).exists()

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


@pytest.mark.django_db
class TestFollowersList:
    def test_public_user_followers_list(self, auth_client, user):
        """Public profile: anyone can list followers"""
        public_user = UsuarioFactory(privacidade_padrao=1)
        follower = UsuarioFactory()
        Seguidor.objects.create(usuario_seguidor=follower, usuario_seguido=public_user, status=1)

        url = reverse('user-followers', args=[public_user.id_usuario])
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['nome_usuario'] == follower.nome_usuario

    def test_private_user_followers_denied(self, auth_client, user):
        """Private profile: non-follower gets 403"""
        private_user = UsuarioFactory(privacidade_padrao=2)
        url = reverse('user-followers', args=[private_user.id_usuario])
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_private_user_followers_allowed_for_follower(self, auth_client, user):
        """Private profile: approved follower can see list"""
        private_user = UsuarioFactory(privacidade_padrao=2)
        Seguidor.objects.create(usuario_seguidor=user, usuario_seguido=private_user, status=1)

        url = reverse('user-followers', args=[private_user.id_usuario])
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_own_followers_always_visible(self, auth_client, user):
        """Owner always sees their own followers list"""
        user.privacidade_padrao = 2
        user.save()
        follower = UsuarioFactory()
        Seguidor.objects.create(usuario_seguidor=follower, usuario_seguido=user, status=1)

        url = reverse('user-followers', args=[user.id_usuario])
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_following_list_privacy(self, auth_client, user):
        """Following list also respects privacy"""
        private_user = UsuarioFactory(privacidade_padrao=2)
        target = UsuarioFactory()
        Seguidor.objects.create(usuario_seguidor=private_user, usuario_seguido=target, status=1)

        # Denied
        url = reverse('user-following', args=[private_user.id_usuario])
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

        # Now follow and retry
        Seguidor.objects.create(usuario_seguidor=user, usuario_seguido=private_user, status=1)
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1


@pytest.mark.django_db
class TestSecretQuestion:
    """Tests for secret question registration and password reset"""

    def test_register_with_secret_question(self, api_client):
        """Registration with both pergunta_secreta and resposta_secreta should succeed"""
        url = reverse('register')
        data = {
            'nome_usuario': 'secretuser',
            'email': 'secret@example.com',
            'nome_completo': 'Secret User',
            'password': 'password123',
            'pergunta_secreta': 1,
            'resposta_secreta': 'myanswer',
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        user = Usuario.objects.get(email='secret@example.com')
        assert user.pergunta_secreta == 1
        assert user.resposta_secreta is not None

    def test_register_without_secret_question(self, api_client):
        """Registration without secret fields should succeed (they are optional)"""
        url = reverse('register')
        data = {
            'nome_usuario': 'nosecret',
            'email': 'nosecret@example.com',
            'nome_completo': 'No Secret User',
            'password': 'password123',
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        user = Usuario.objects.get(email='nosecret@example.com')
        assert user.pergunta_secreta is None
        assert user.resposta_secreta is None

    def test_register_with_only_pergunta_fails(self, api_client):
        """Providing only pergunta_secreta without resposta_secreta should fail"""
        url = reverse('register')
        data = {
            'nome_usuario': 'partialuser',
            'email': 'partial@example.com',
            'nome_completo': 'Partial User',
            'password': 'password123',
            'pergunta_secreta': 1,
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_password_reset_with_correct_answer(self, api_client):
        """Password reset with correct secret answer should succeed"""
        from django.contrib.auth.hashers import make_password
        user = UsuarioFactory(email='reset@example.com', nome_usuario='resetuser')
        user.pergunta_secreta = 1
        user.resposta_secreta = make_password('correct answer')
        user.save()

        url = reverse('password_reset')
        data = {
            'email': 'reset@example.com',
            'nome_usuario': 'resetuser',
            'resposta_secreta': 'correct answer',
            'new_password': 'newpassword123',
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_200_OK

    def test_password_reset_with_wrong_answer(self, api_client):
        """Password reset with wrong secret answer should fail with generic message"""
        from django.contrib.auth.hashers import make_password
        user = UsuarioFactory(email='wronganswer@example.com', nome_usuario='wrongansweruser')
        user.pergunta_secreta = 1
        user.resposta_secreta = make_password('correct answer')
        user.save()

        url = reverse('password_reset')
        data = {
            'email': 'wronganswer@example.com',
            'nome_usuario': 'wrongansweruser',
            'resposta_secreta': 'wrong answer',
            'new_password': 'newpassword123',
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        error_text = str(response.data)
        assert 'Não foi possível verificar sua identidade' in error_text

    def test_password_reset_user_without_secret_question(self, api_client):
        """Password reset for user without secret question should fail with generic message"""
        user = UsuarioFactory(email='nosecret2@example.com', nome_usuario='nosecret2user')

        url = reverse('password_reset')
        data = {
            'email': 'nosecret2@example.com',
            'nome_usuario': 'nosecret2user',
            'resposta_secreta': 'some answer',
            'new_password': 'newpassword123',
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        error_text = str(response.data)
        assert 'Não foi possível verificar sua identidade' in error_text

    def test_password_reset_nonexistent_user(self, api_client):
        """Password reset for nonexistent user should fail with generic message"""
        url = reverse('password_reset')
        data = {
            'email': 'nobody@example.com',
            'nome_usuario': 'nobody',
            'resposta_secreta': 'any answer',
            'new_password': 'newpassword123',
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        error_text = str(response.data)
        assert 'Não foi possível verificar sua identidade' in error_text

    def test_password_reset_answer_case_insensitive(self, api_client):
        """Secret answer comparison should be case-insensitive"""
        from django.contrib.auth.hashers import make_password
        user = UsuarioFactory(email='casetest@example.com', nome_usuario='casetestuser')
        user.pergunta_secreta = 1
        # Stored as lowercase
        user.resposta_secreta = make_password('correct answer')
        user.save()

        url = reverse('password_reset')
        data = {
            'email': 'casetest@example.com',
            'nome_usuario': 'casetestuser',
            'resposta_secreta': 'CORRECT ANSWER',
            'new_password': 'newpassword123',
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_200_OK

    def test_password_reset_answer_with_special_chars(self, api_client):
        """Secret answer with special characters should work correctly"""
        from django.contrib.auth.hashers import make_password
        user = UsuarioFactory(email='special@example.com', nome_usuario='specialuser')
        user.pergunta_secreta = 1
        user.resposta_secreta = make_password('answer!@#$%')
        user.save()

        url = reverse('password_reset')
        data = {
            'email': 'special@example.com',
            'nome_usuario': 'specialuser',
            'resposta_secreta': 'answer!@#$%',
            'new_password': 'newpassword123',
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestAvatarUpload:
    """Tests for avatar upload and old avatar cleanup"""

    def test_avatar_upload_success(self, auth_client, tmp_path):
        """Avatar upload should succeed with valid image file"""
        import io
        url = reverse('avatar_upload')
        image_content = b'\x89PNG\r\n\x1a\n' + b'\x00' * 100
        image_file = io.BytesIO(image_content)
        image_file.name = 'test.png'
        response = auth_client.post(url, {'avatar': image_file}, format='multipart')
        assert response.status_code == status.HTTP_200_OK
        assert 'avatar_url' in response.data

    def test_avatar_upload_deletes_old_avatar(self, auth_client, user, tmp_path):
        """Old avatar file should be deleted when a new one is uploaded"""
        import io
        import os
        from django.conf import settings

        # Create a fake old avatar file
        avatars_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
        os.makedirs(avatars_dir, exist_ok=True)
        old_filename = 'old_avatar_test.png'
        old_filepath = os.path.join(avatars_dir, old_filename)
        with open(old_filepath, 'wb') as f:
            f.write(b'fake image content')

        # Set the user's avatar_url to point to the old file
        user.avatar_url = f'{settings.MEDIA_URL}avatars/{old_filename}'
        user.save()

        # Upload a new avatar
        image_content = b'\x89PNG\r\n\x1a\n' + b'\x00' * 100
        image_file = io.BytesIO(image_content)
        image_file.name = 'new_avatar.png'

        url = reverse('avatar_upload')
        response = auth_client.post(url, {'avatar': image_file}, format='multipart')

        assert response.status_code == status.HTTP_200_OK
        # Old file should be deleted
        assert not os.path.exists(old_filepath)

    def test_avatar_upload_succeeds_when_old_file_missing(self, auth_client, user):
        """Upload should succeed even if old avatar file cannot be found"""
        import io
        from django.conf import settings

        # Set avatar_url to a non-existent file
        user.avatar_url = f'{settings.MEDIA_URL}avatars/nonexistent_file.png'
        user.save()

        image_content = b'\x89PNG\r\n\x1a\n' + b'\x00' * 100
        image_file = io.BytesIO(image_content)
        image_file.name = 'new_avatar.png'

        url = reverse('avatar_upload')
        response = auth_client.post(url, {'avatar': image_file}, format='multipart')

        assert response.status_code == status.HTTP_200_OK

    def test_avatar_upload_no_previous_avatar(self, auth_client, user):
        """Upload should succeed when user has no previous avatar"""
        import io

        user.avatar_url = None
        user.save()

        image_content = b'\x89PNG\r\n\x1a\n' + b'\x00' * 100
        image_file = io.BytesIO(image_content)
        image_file.name = 'new_avatar.png'

        url = reverse('avatar_upload')
        response = auth_client.post(url, {'avatar': image_file}, format='multipart')

        assert response.status_code == status.HTTP_200_OK
        assert 'avatar_url' in response.data

    def test_avatar_upload_invalid_extension(self, auth_client):
        """Upload with disallowed file extension should fail"""
        import io
        url = reverse('avatar_upload')
        file_content = b'not an image'
        file_obj = io.BytesIO(file_content)
        file_obj.name = 'test.txt'
        response = auth_client.post(url, {'avatar': file_obj}, format='multipart')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_avatar_path_uses_media_root(self, auth_client, user):
        """Avatar file path should be built using MEDIA_ROOT"""
        import io
        import os
        from django.conf import settings

        url = reverse('avatar_upload')
        image_content = b'\x89PNG\r\n\x1a\n' + b'\x00' * 100
        image_file = io.BytesIO(image_content)
        image_file.name = 'test.png'

        response = auth_client.post(url, {'avatar': image_file}, format='multipart')
        assert response.status_code == status.HTTP_200_OK

        user.refresh_from_db()
        # The avatar_url should be a relative URL starting with MEDIA_URL
        assert user.avatar_url.startswith(settings.MEDIA_URL)
        # The file should exist under MEDIA_ROOT
        filename = os.path.basename(user.avatar_url)
        expected_path = os.path.join(settings.MEDIA_ROOT, 'avatars', filename)
        assert os.path.exists(expected_path)
