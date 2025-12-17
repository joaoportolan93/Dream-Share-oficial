"""
Factory classes for creating test data using factory_boy.

These factories create model instances for use in automated tests,
providing consistent and realistic test data.
"""

import factory
from factory.django import DjangoModelFactory
from factory import Faker, LazyAttribute, Sequence, SubFactory, post_generation
from django.utils import timezone
from datetime import timedelta
import random

from core.models import Usuario, Publicacao, Comentario, Seguidor, Hashtag, ReacaoPublicacao, Notificacao


class UsuarioFactory(DjangoModelFactory):
    """Factory for creating test users"""
    
    class Meta:
        model = Usuario
        skip_postgeneration_save = True
    
    nome_usuario = Sequence(lambda n: f'testuser{n}')
    email = LazyAttribute(lambda obj: f'{obj.nome_usuario}@test.com')
    nome_completo = Faker('name', locale='pt_BR')
    bio = Faker('sentence')
    data_nascimento = Faker('date_of_birth', minimum_age=18, maximum_age=60)
    status = 1
    verificado = False
    
    @post_generation
    def password(obj, create, extracted, **kwargs):
        password = extracted or 'TestPass123!'
        obj.set_password(password)
        if create:
            obj.save()


class HashtagFactory(DjangoModelFactory):
    """Factory for creating test hashtags"""
    
    class Meta:
        model = Hashtag
    
    texto_hashtag = Sequence(lambda n: f'hashtag{n}')
    contagem_uso = Faker('random_int', min=1, max=100)
    primeira_utilizacao = LazyAttribute(lambda _: timezone.now() - timedelta(days=30))
    ultima_utilizacao = LazyAttribute(lambda _: timezone.now())


class PublicacaoFactory(DjangoModelFactory):
    """Factory for creating test publications (dreams)"""
    
    class Meta:
        model = Publicacao
    
    usuario = SubFactory(UsuarioFactory)
    titulo = Faker('sentence', nb_words=5)
    conteudo_texto = Faker('paragraph', nb_sentences=3)
    data_sonho = Faker('date_this_month')
    tipo_sonho = factory.LazyFunction(lambda: random.choice(['Lúcido', 'Normal', 'Pesadelo']))
    visibilidade = 1  # Public by default
    emocoes_sentidas = factory.LazyFunction(lambda: random.choice(['Alegria', 'Medo', 'Curiosidade']))
    data_publicacao = LazyAttribute(lambda _: timezone.now())
    views_count = Faker('random_int', min=0, max=100)


class ComentarioFactory(DjangoModelFactory):
    """Factory for creating test comments"""
    
    class Meta:
        model = Comentario
    
    usuario = SubFactory(UsuarioFactory)
    publicacao = SubFactory(PublicacaoFactory)
    conteudo_texto = Faker('sentence')
    data_comentario = LazyAttribute(lambda _: timezone.now())
    status = 1


class SeguidorFactory(DjangoModelFactory):
    """Factory for creating follower relationships"""
    
    class Meta:
        model = Seguidor
    
    usuario_seguidor = SubFactory(UsuarioFactory)
    usuario_seguido = SubFactory(UsuarioFactory)
    status = 1
    data_seguimento = LazyAttribute(lambda _: timezone.now())


class ReacaoPublicacaoFactory(DjangoModelFactory):
    """Factory for creating likes on posts"""
    
    class Meta:
        model = ReacaoPublicacao
    
    publicacao = SubFactory(PublicacaoFactory)
    usuario = SubFactory(UsuarioFactory)
    data_reacao = LazyAttribute(lambda _: timezone.now())


class NotificacaoFactory(DjangoModelFactory):
    """Factory for creating notifications"""
    
    class Meta:
        model = Notificacao
    
    usuario_destino = SubFactory(UsuarioFactory)
    usuario_origem = SubFactory(UsuarioFactory)
    tipo_notificacao = factory.LazyFunction(lambda: random.choice([1, 2, 3, 4]))
    conteudo = Faker('sentence')
    lida = False
    data_criacao = LazyAttribute(lambda _: timezone.now())
