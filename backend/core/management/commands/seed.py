"""
Django management command to seed the database with fake data for development.

Usage:
    python manage.py seed          # Create test data
    python manage.py seed --clear  # Clear existing data and create new
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker
import random
from datetime import timedelta

from core.models import (
    Usuario, Publicacao, Comentario, Seguidor, Hashtag, 
    PublicacaoHashtag, ReacaoPublicacao, Notificacao
)


class Command(BaseCommand):
    help = 'Seed the database with fake data for development'
    
    def __init__(self):
        super().__init__()
        self.fake = Faker('pt_BR')
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all data before seeding',
        )
    
    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Limpando dados existentes...'))
            self.clear_data()
        
        self.stdout.write(self.style.SUCCESS('Iniciando seed de dados...'))
        
        # Create data in order
        users = self.create_users()
        hashtags = self.create_hashtags()
        publicacoes = self.create_publicacoes(users, hashtags)
        self.create_comentarios(users, publicacoes)
        self.create_reacoes(users, publicacoes)
        self.create_seguidores(users)
        self.create_notificacoes(users)
        
        self.stdout.write(self.style.SUCCESS('✅ Seed concluído com sucesso!'))
    
    def clear_data(self):
        """Clear all seed-able data from the database"""
        Notificacao.objects.all().delete()
        ReacaoPublicacao.objects.all().delete()
        Comentario.objects.all().delete()
        PublicacaoHashtag.objects.all().delete()
        Publicacao.objects.all().delete()
        Seguidor.objects.all().delete()
        Hashtag.objects.all().delete()
        # Keep admin user, delete only test users
        Usuario.objects.filter(nome_usuario__startswith='user_').delete()
        self.stdout.write(self.style.SUCCESS('Dados limpos!'))
    
    def create_users(self):
        """Create 10 fake users"""
        self.stdout.write('Criando usuários...')
        users = []
        
        dream_bios = [
            "Explorando o mundo dos sonhos 🌙",
            "Sonhador(a) lucido(a) em treinamento ✨",
            "Interpretando símbolos oníricos desde 2020",
            "Cada sonho conta uma história 📖",
            "Conectando o consciente ao inconsciente",
            "Diário de sonhos digital 🌌",
            "Buscando significados no mundo dos sonhos",
            "Pesadelos? Prefiro chamar de aventuras noturnas 🦇",
            "Sonhos são mensagens da alma",
            "Viajante dos reinos oníricos 🚀"
        ]
        
        for i in range(10):
            nome_usuario = f"user_{self.fake.user_name()[:10]}_{i}"
            email = f"{nome_usuario}@dreamshare.test"
            
            user = Usuario.objects.create_user(
                email=email,
                nome_usuario=nome_usuario,
                nome_completo=self.fake.name(),
                password='TestPass123!'
            )
            user.bio = dream_bios[i]
            user.data_nascimento = self.fake.date_of_birth(minimum_age=18, maximum_age=60)
            user.save()
            users.append(user)
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(users)} usuários criados'))
        return users
    
    def create_hashtags(self):
        """Create 20 popular dream-related hashtags"""
        self.stdout.write('Criando hashtags...')
        
        hashtag_texts = [
            'sonholucido', 'pesadelo', 'voar', 'agua', 'queda',
            'perseguicao', 'familia', 'morte', 'animais', 'viagem',
            'escola', 'trabalho', 'amor', 'medo', 'alegria',
            'natureza', 'cidade', 'noite', 'luz', 'escuridao'
        ]
        
        hashtags = []
        for text in hashtag_texts:
            hashtag, created = Hashtag.objects.get_or_create(
                texto_hashtag=text,
                defaults={
                    'contagem_uso': random.randint(5, 100),
                    'primeira_utilizacao': timezone.now() - timedelta(days=random.randint(30, 365)),
                    'ultima_utilizacao': timezone.now() - timedelta(days=random.randint(0, 30))
                }
            )
            hashtags.append(hashtag)
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(hashtags)} hashtags criadas'))
        return hashtags
    
    def create_publicacoes(self, users, hashtags):
        """Create 50 dream posts distributed among users"""
        self.stdout.write('Criando publicações...')
        
        titulos_sonhos = [
            "Voando sobre oceanos infinitos",
            "O labirinto misterioso",
            "Encontro com um ente querido",
            "A casa da minha infância",
            "Perseguido por sombras",
            "Um mundo subaquático",
            "Viagem no tempo",
            "O jardim encantado",
            "Caindo no vazio",
            "A luz no fim do túnel"
        ]
        
        tipos_sonho = ['Lúcido', 'Normal', 'Pesadelo', 'Recorrente', 'Vívido']
        emocoes = ['Alegria', 'Medo', 'Curiosidade', 'Paz', 'Ansiedade', 'Confusão', 'Nostalgia']
        
        publicacoes = []
        for i in range(50):
            user = random.choice(users)
            selected_hashtags = random.sample(hashtags, random.randint(1, 4))
            hashtag_text = ' '.join([f'#{h.texto_hashtag}' for h in selected_hashtags])
            
            conteudo = f"{self.fake.paragraph(nb_sentences=5)} {hashtag_text}"
            
            pub = Publicacao.objects.create(
                usuario=user,
                titulo=random.choice(titulos_sonhos) if random.random() > 0.3 else None,
                conteudo_texto=conteudo,
                data_sonho=self.fake.date_between(start_date='-30d', end_date='today'),
                tipo_sonho=random.choice(tipos_sonho),
                visibilidade=random.choices([1, 2, 3], weights=[70, 20, 10])[0],
                emocoes_sentidas=', '.join(random.sample(emocoes, random.randint(1, 3))),
                data_publicacao=timezone.now() - timedelta(
                    days=random.randint(0, 60),
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59)
                ),
                views_count=random.randint(0, 500)
            )
            
            # Create hashtag relationships
            for hashtag in selected_hashtags:
                PublicacaoHashtag.objects.get_or_create(
                    publicacao=pub,
                    hashtag=hashtag
                )
            
            publicacoes.append(pub)
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(publicacoes)} publicações criadas'))
        return publicacoes
    
    def create_comentarios(self, users, publicacoes):
        """Create 100 comments distributed across posts"""
        self.stdout.write('Criando comentários...')
        
        comentarios_exemplos = [
            "Sonho muito interessante! Já tive algo parecido.",
            "Isso pode significar uma grande transformação na sua vida.",
            "Adorei a descrição, muito vívido!",
            "Você já tentou interpretar os símbolos?",
            "Esse tipo de sonho é muito comum em períodos de mudança.",
            "Incrível! Conta mais detalhes?",
            "Me identifiquei muito com esse sonho.",
            "Que experiência única!",
            "Tenta manter um diário de sonhos, ajuda muito!",
            "Sonhos com água geralmente indicam emoções profundas."
        ]
        
        count = 0
        for _ in range(100):
            pub = random.choice(publicacoes)
            user = random.choice([u for u in users if u != pub.usuario])
            
            Comentario.objects.create(
                publicacao=pub,
                usuario=user,
                conteudo_texto=random.choice(comentarios_exemplos) + " " + self.fake.sentence(),
                data_comentario=pub.data_publicacao + timedelta(
                    hours=random.randint(1, 48),
                    minutes=random.randint(0, 59)
                ),
                status=1
            )
            count += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {count} comentários criados'))
    
    def create_reacoes(self, users, publicacoes):
        """Create 200 likes distributed across posts"""
        self.stdout.write('Criando reações...')
        
        count = 0
        for _ in range(200):
            pub = random.choice(publicacoes)
            user = random.choice(users)
            
            # Check if reaction already exists
            if not ReacaoPublicacao.objects.filter(publicacao=pub, usuario=user).exists():
                ReacaoPublicacao.objects.create(
                    publicacao=pub,
                    usuario=user,
                    data_reacao=pub.data_publicacao + timedelta(
                        hours=random.randint(0, 72),
                        minutes=random.randint(0, 59)
                    )
                )
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {count} reações criadas'))
    
    def create_seguidores(self, users):
        """Create 30 follow relationships between users"""
        self.stdout.write('Criando relacionamentos de seguidores...')
        
        count = 0
        attempts = 0
        while count < 30 and attempts < 100:
            seguidor = random.choice(users)
            seguido = random.choice(users)
            
            if seguidor != seguido:
                _, created = Seguidor.objects.get_or_create(
                    usuario_seguidor=seguidor,
                    usuario_seguido=seguido,
                    defaults={'status': 1}
                )
                if created:
                    count += 1
            attempts += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {count} relações de follow criadas'))
    
    def create_notificacoes(self, users):
        """Create some sample notifications"""
        self.stdout.write('Criando notificações...')
        
        tipos = [1, 2, 3, 4]  # Post, Comment, Like, Follow
        
        count = 0
        for _ in range(20):
            destino = random.choice(users)
            origem = random.choice([u for u in users if u != destino])
            
            Notificacao.objects.create(
                usuario_destino=destino,
                usuario_origem=origem,
                tipo_notificacao=random.choice(tipos),
                conteudo=self.fake.sentence()[:100],
                lida=random.choice([True, False]),
                data_criacao=timezone.now() - timedelta(
                    days=random.randint(0, 14),
                    hours=random.randint(0, 23)
                )
            )
            count += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {count} notificações criadas'))
