import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from .factories import UsuarioFactory
from .models import Comunidade, MembroComunidade, Usuario, Publicacao

@pytest.fixture
def auth_client():
    user = UsuarioFactory()
    client = APIClient()
    client.force_authenticate(user=user)
    return client, user

@pytest.mark.django_db
class TestCommunityFeatures:
    
    def test_community_creation_with_rules(self, auth_client):
        client, user = auth_client
        url = reverse('communities-list')
        
        rules = [
            {"title": "Be Nice", "description": "No hate speech", "created_at": "2024-01-01"},
            {"title": "No Spam", "description": "Don't post spam", "created_at": "2024-01-01"}
        ]
        
        data = {
            'nome': 'Rules Community',
            'descricao': 'A community with rules',
            'regras': rules,
            'imagem': None
        }
        
        response = client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['regras'] == rules
        assert Comunidade.objects.get(nome='Rules Community').regras == rules

    def test_join_leave_community(self, auth_client):
        client, user = auth_client
        community = Comunidade.objects.create(nome='Test Community', descricao='Testing join')
        
        # Join
        url_join = reverse('communities-join', args=[community.id_comunidade])
        response = client.post(url_join)
        assert response.status_code == status.HTTP_200_OK
        assert MembroComunidade.objects.filter(comunidade=community, usuario=user).exists()
        
        # Verify serialized data shows is_member=True
        url_detail = reverse('communities-detail', args=[community.id_comunidade])
        response = client.get(url_detail)
        assert response.data['is_member'] is True
        assert response.data['membros_count'] == 1

        # Leave
        url_leave = reverse('communities-leave', args=[community.id_comunidade])
        response = client.post(url_leave)
        assert response.status_code == status.HTTP_200_OK
        assert not MembroComunidade.objects.filter(comunidade=community, usuario=user).exists()

    def test_moderator_stats_access_control(self, auth_client):
        client, user = auth_client
        community = Comunidade.objects.create(nome='Mod Stats Community', descricao='Stats test')
        
        # User is NOT a member yet
        url_stats = reverse('communities-moderator-stats', args=[community.id_comunidade])
        response = client.get(url_stats)
        assert response.status_code == status.HTTP_403_FORBIDDEN

        # User joins as Member
        MembroComunidade.objects.create(comunidade=community, usuario=user, role='member')
        response = client.get(url_stats)
        assert response.status_code == status.HTTP_403_FORBIDDEN

        # User promoted to Moderator
        membro = MembroComunidade.objects.get(comunidade=community, usuario=user)
        membro.role = 'moderator'
        membro.save()
        
        response = client.get(url_stats)
        assert response.status_code == status.HTTP_200_OK
        assert 'total_members' in response.data
        assert 'new_members_last_7_days' in response.data

    def test_moderator_stats_calculations(self, auth_client):
        client, mod_user = auth_client
        community = Comunidade.objects.create(nome='Stats Calc Community', descricao='Math test')
        
        # Setup Mod
        MembroComunidade.objects.create(comunidade=community, usuario=mod_user, role='moderator')
        
        # Add another member
        user2 = UsuarioFactory(nome_usuario='user2', email='u2@test.com')
        MembroComunidade.objects.create(comunidade=community, usuario=user2, role='member')
        
        # Get stats
        url_stats = reverse('communities-moderator-stats', args=[community.id_comunidade])
        response = client.get(url_stats)
        
        assert response.data['total_members'] == 2
        assert response.data['new_members_last_7_days'] == 2
