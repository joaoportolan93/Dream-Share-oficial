import factory
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Publicacao, Comentario, Hashtag

User = get_user_model()

class UsuarioFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    nome_usuario = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda o: f'{o.nome_usuario}@example.com')
    nome_completo = factory.Faker('name')
    data_nascimento = factory.Faker('date_of_birth', minimum_age=18)
    
    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        password = extracted or 'password123'
        self.set_password(password)

class HashtagFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Hashtag

    texto_hashtag = factory.Sequence(lambda n: f'tag{n}')

class PublicacaoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Publicacao

    usuario = factory.SubFactory(UsuarioFactory)
    conteudo_texto = factory.Faker('paragraph')
    titulo = factory.Faker('sentence')
    visibilidade = 1  # Público
    data_publicacao = factory.LazyFunction(timezone.now)

class ComentarioFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Comentario

    usuario = factory.SubFactory(UsuarioFactory)
    publicacao = factory.SubFactory(PublicacaoFactory)
    conteudo_texto = factory.Faker('sentence')
