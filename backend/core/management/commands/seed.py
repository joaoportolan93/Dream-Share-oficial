"""
Seed Command - Issue #33
Populates the database with sample data for development and testing.
"""
import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from core.models import (
    Usuario, Publicacao, Comentario, Seguidor, 
    ReacaoPublicacao, Hashtag, PublicacaoHashtag, Denuncia, Notificacao
)


class Command(BaseCommand):
    help = 'Seed the database with sample data for development'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=10,
            help='Number of users to create (default: 10)'
        )
        parser.add_argument(
            '--posts',
            type=int,
            default=30,
            help='Number of posts to create (default: 30)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding'
        )

    def handle(self, *args, **options):
        num_users = options['users']
        num_posts = options['posts']
        
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            self.clear_data()
        
        self.stdout.write(self.style.WARNING(f'🌱 Starting seed with {num_users} users and {num_posts} posts...'))
        
        users = self.create_users(num_users)
        hashtags = self.create_hashtags()
        posts = self.create_posts(users, hashtags, num_posts)
        self.create_follows(users)
        self.create_likes(users, posts)
        self.create_comments(users, posts)
        self.create_reports(users, posts)
        
        self.stdout.write(self.style.SUCCESS('✅ Seed completed successfully!'))
        self.print_summary()

    def clear_data(self):
        """Clear all seeded data (except admin users)"""
        Denuncia.objects.all().delete()
        Notificacao.objects.all().delete()
        ReacaoPublicacao.objects.all().delete()
        Comentario.objects.all().delete()
        PublicacaoHashtag.objects.all().delete()
        Publicacao.objects.all().delete()
        Seguidor.objects.all().delete()
        Hashtag.objects.all().delete()
        Usuario.objects.filter(is_admin=False).delete()
        self.stdout.write(self.style.SUCCESS('Data cleared!'))

    def create_users(self, count):
        """Create sample users"""
        self.stdout.write('Creating users...')
        
        # Sample user data
        first_names = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe', 'Gabriela', 
                       'Hugo', 'Isabel', 'João', 'Karen', 'Lucas', 'Marina', 'Nicolas', 
                       'Olivia', 'Pedro', 'Rafaela', 'Samuel', 'Thais', 'Victor']
        
        last_names = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 
                      'Almeida', 'Nascimento', 'Lima', 'Araújo', 'Pereira', 'Costa']
        
        bios = [
            "Sonhador profissional 🌙",
            "Explorando o mundo dos sonhos ✨",
            "Cada noite uma nova aventura 💫",
            "Compartilhando meus sonhos mais loucos 🚀",
            "Interpretando o subconsciente 🧠",
            "Sonhos lúcidos são minha especialidade 🌟",
            "Transformando pesadelos em arte 🎨",
            "Diário de sonhos desde 2020 📖",
            "Acredito que sonhos têm significado 🔮",
            "Viajante entre dimensões oníricas 🌌"
        ]

        users = []
        for i in range(count):
            first = random.choice(first_names)
            last = random.choice(last_names)
            username = f"{first.lower()}_{last.lower()}_{random.randint(1, 999)}"
            email = f"{username}@dreamshare.test"
            
            # Check if user already exists
            if Usuario.objects.filter(email=email).exists():
                continue
                
            user = Usuario.objects.create_user(
                email=email,
                nome_usuario=username,
                nome_completo=f"{first} {last}",
                password="teste123"
            )
            user.bio = random.choice(bios)
            user.data_criacao = timezone.now() - timedelta(days=random.randint(1, 365))
            user.save()
            users.append(user)
            
        self.stdout.write(f'  Created {len(users)} users')
        return users

    def create_hashtags(self):
        """Create common hashtags"""
        self.stdout.write('Creating hashtags...')
        
        hashtag_texts = [
            'sonholucido', 'pesadelo', 'sonhorecorrente', 'voar', 'cair',
            'perseguicao', 'agua', 'animais', 'familia', 'viagem',
            'aventura', 'misterio', 'romance', 'terror', 'fantasia',
            'profecia', 'deja_vu', 'paralisia', 'cores', 'musica'
        ]
        
        hashtags = []
        for text in hashtag_texts:
            hashtag, created = Hashtag.objects.get_or_create(
                texto_hashtag=text,
                defaults={'contagem_uso': random.randint(1, 50)}
            )
            hashtags.append(hashtag)
            
        self.stdout.write(f'  Created/found {len(hashtags)} hashtags')
        return hashtags

    def create_posts(self, users, hashtags, count):
        """Create sample dream posts"""
        self.stdout.write('Creating posts...')
        
        dream_titles = [
            "Voando sobre a cidade",
            "O labirinto infinito",
            "Encontro com meu eu do futuro",
            "A praia dos sonhos dourados",
            "Correndo em câmera lenta",
            "A casa que muda de forma",
            "Conversando com animais",
            "O elevador sem fim",
            "Voltando à escola",
            "Dentes caindo",
            "Perdido em cidade desconhecida",
            "A escada para as nuvens",
            "O espelho que mostra outro mundo",
            "Nadando com baleias",
            "O relógio que para o tempo"
        ]
        
        dream_contents = [
            "Estava voando sobre uma cidade enorme, as luzes brilhavam como estrelas no chão. Sentia uma liberdade indescritível.",
            "Entrei em um labirinto e quanto mais andava, mais perdido ficava. As paredes mudavam quando eu não olhava.",
            "Encontrei uma versão mais velha de mim mesmo. Ele me deu conselhos que ainda estou tentando entender.",
            "Uma praia com areia dourada e mar cristalino. O sol nunca se punha e o tempo não passava.",
            "Precisava correr de algo, mas minhas pernas se moviam em câmera lenta. A sensação de urgência era real.",
            "Minha casa da infância, mas cada vez que entrava em um cômodo, a planta mudava completamente.",
            "Os animais falavam comigo e contavam segredos sobre a natureza. Um corvo foi especialmente sábio.",
            "Um elevador que subia eternamente. Cada andar revelava uma cena diferente da minha vida.",
            "Voltei à escola, mas não lembrava de nenhuma matéria. Todos me olhavam esperando respostas.",
            "Meus dentes começaram a cair um por um. Acordei verificando se ainda estavam lá.",
            "Uma cidade que eu nunca visitei, mas parecia familiar. As ruas não levavam a lugar nenhum.",
            "Uma escada de mármore que levava além das nuvens. No topo havia uma porta de luz.",
            "O espelho do banheiro mostrava outro lugar. Quando passei para o outro lado, era um mundo invertido.",
            "Nadando em águas profundas com baleias gigantes. Elas cantavam e eu entendia a melodia.",
            "Encontrei um relógio que parava o tempo. Passei horas explorando o mundo congelado."
        ]
        
        dream_types = ['Lúcido', 'Pesadelo', 'Normal', 'Recorrente']
        
        posts = []
        for i in range(count):
            user = random.choice(users)
            
            # Add hashtags to content
            post_hashtags = random.sample(hashtags, k=random.randint(1, 3))
            hashtag_text = ' '.join([f'#{h.texto_hashtag}' for h in post_hashtags])
            
            post = Publicacao.objects.create(
                usuario=user,
                titulo=random.choice(dream_titles),
                conteudo_texto=f"{random.choice(dream_contents)}\n\n{hashtag_text}",
                tipo_sonho=random.choice(dream_types),
                visibilidade=random.choices([1, 2], weights=[0.8, 0.2])[0],
                data_publicacao=timezone.now() - timedelta(
                    days=random.randint(0, 30),
                    hours=random.randint(0, 23)
                )
            )
            
            # Create hashtag relationships
            for hashtag in post_hashtags:
                PublicacaoHashtag.objects.create(publicacao=post, hashtag=hashtag)
                hashtag.contagem_uso += 1
                hashtag.save()
            
            posts.append(post)
            
        self.stdout.write(f'  Created {len(posts)} posts')
        return posts

    def create_follows(self, users):
        """Create follow relationships"""
        self.stdout.write('Creating follows...')
        
        follow_count = 0
        for user in users:
            # Each user follows 2-5 random other users
            others = [u for u in users if u != user]
            to_follow = random.sample(others, k=min(random.randint(2, 5), len(others)))
            
            for target in to_follow:
                follow, created = Seguidor.objects.get_or_create(
                    usuario_seguidor=user,
                    usuario_seguido=target,
                    defaults={'status': 1}
                )
                if created:
                    follow_count += 1
                    
        self.stdout.write(f'  Created {follow_count} follow relationships')

    def create_likes(self, users, posts):
        """Create likes on posts"""
        self.stdout.write('Creating likes...')
        
        like_count = 0
        for post in posts:
            # 30-70% of users like each post
            likers = random.sample(users, k=random.randint(len(users)//3, len(users)*2//3))
            
            for user in likers:
                reaction, created = ReacaoPublicacao.objects.get_or_create(
                    usuario=user,
                    publicacao=post
                )
                if created:
                    like_count += 1
                    
        self.stdout.write(f'  Created {like_count} likes')

    def create_comments(self, users, posts):
        """Create comments on posts"""
        self.stdout.write('Creating comments...')
        
        comments_text = [
            "Que sonho incrível! 🌙",
            "Já tive um sonho parecido!",
            "Muito interessante a simbologia 🔮",
            "Sonhos assim são os melhores",
            "Isso me lembra algo...",
            "Conta mais detalhes!",
            "Adorei a descrição ✨",
            "Que experiência única!",
            "Sonhos lúcidos são incríveis",
            "Você conseguiu controlar?",
            "Já pesquisou o significado?",
            "Impressionante! 💫",
            "Que viagem onírica!",
            "Me identifiquei demais",
            "Preciso sonhar assim também 😄"
        ]
        
        comment_count = 0
        for post in posts:
            # 0-5 comments per post
            num_comments = random.randint(0, 5)
            commenters = random.sample(users, k=min(num_comments, len(users)))
            
            for user in commenters:
                Comentario.objects.create(
                    usuario=user,
                    publicacao=post,
                    conteudo_texto=random.choice(comments_text),
                    data_comentario=post.data_publicacao + timedelta(
                        hours=random.randint(1, 48)
                    )
                )
                comment_count += 1
                
        self.stdout.write(f'  Created {comment_count} comments')

    def create_reports(self, users, posts):
        """Create a few sample reports"""
        self.stdout.write('Creating sample reports...')
        
        # Create 2-3 pending reports
        sample_posts = random.sample(posts, k=min(3, len(posts)))
        
        for post in sample_posts:
            reporter = random.choice([u for u in users if u != post.usuario])
            Denuncia.objects.create(
                usuario_denunciante=reporter,
                tipo_conteudo=1,  # Post
                id_conteudo=post.id_publicacao,
                motivo_denuncia=random.randint(1, 3),
                descricao_denuncia="Conteúdo reportado para teste de moderação.",
                status_denuncia=1  # Pendente
            )
            
        self.stdout.write(f'  Created {len(sample_posts)} sample reports')

    def print_summary(self):
        """Print database summary"""
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('📊 Database Summary:'))
        self.stdout.write(f'  👤 Users: {Usuario.objects.count()}')
        self.stdout.write(f'  📝 Posts: {Publicacao.objects.count()}')
        self.stdout.write(f'  💬 Comments: {Comentario.objects.count()}')
        self.stdout.write(f'  👥 Follows: {Seguidor.objects.count()}')
        self.stdout.write(f'  ❤️ Likes: {ReacaoPublicacao.objects.count()}')
        self.stdout.write(f'  #️⃣ Hashtags: {Hashtag.objects.count()}')
        self.stdout.write(f'  🚨 Reports: {Denuncia.objects.count()}')
        self.stdout.write('='*50)
        self.stdout.write(self.style.WARNING('\n🔑 Test credentials: Any seeded user with password "teste123"'))
