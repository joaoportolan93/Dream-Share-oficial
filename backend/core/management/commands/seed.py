"""
Seed Command - Issue #33
Populates the database with realistic sample data for development and testing.
Dream content is original, inspired by real dream journal narratives.
"""
import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from core.models import (
    Usuario, Publicacao, Comentario, Seguidor, 
    ReacaoPublicacao, Hashtag, PublicacaoHashtag, Denuncia, Notificacao
)
from .seed_data import DREAM_POSTS


# ============================================================
# REALISTIC USER PROFILES
# ============================================================
USER_PROFILES = [
    {
        'nome_usuario': 'luna_freitas',
        'nome_completo': 'Luna Freitas',
        'email': 'luna.freitas@dreamshare.test',
        'bio': 'Sonhadora lúcida desde os 14 🌙 | Estudante de Psicologia | Meus sonhos contam histórias que minha mente acordada não consegue',
        'pergunta_secreta': 1,
        'resposta_secreta': 'luna123',
    },
    {
        'nome_usuario': 'rafael_dreams',
        'nome_completo': 'Rafael Mendes',
        'email': 'rafael.mendes@dreamshare.test',
        'bio': 'Diário de sonhos desde 2022 📖 | Às vezes engraçados, às vezes aterrorizantes | Tento entender o que meu subconsciente quer dizer',
        'pergunta_secreta': 2,
        'resposta_secreta': 'rafael123',
    },
    {
        'nome_usuario': 'isa_noturna',
        'nome_completo': 'Isabela Rocha',
        'email': 'isabela.rocha@dreamshare.test',
        'bio': 'Enfermeira de dia, viajante astral de noite ✨ | Tenho sonhos premonitórios desde criança e isso me assusta e fascina ao mesmo tempo',
    },
    {
        'nome_usuario': 'gustavoo_s',
        'nome_completo': 'Gustavo Santana',
        'email': 'gustavo.santana@dreamshare.test',
        'bio': 'Meus sonhos são mais interessantes que minha vida real kkkk 💤 | Dev frontend | Café e pesadelos',
    },
    {
        'nome_usuario': 'camila.oneiros',
        'nome_completo': 'Camila Duarte',
        'email': 'camila.duarte@dreamshare.test',
        'bio': 'Artista plástica 🎨 | Pinto quadros baseados nos meus sonhos | O subconsciente é o melhor curador de arte que existe',
    },
    {
        'nome_usuario': 'thi_lucido',
        'nome_completo': 'Thiago Borges',
        'email': 'thiago.borges@dreamshare.test',
        'bio': 'Praticante de sonho lúcido há 3 anos 🧠 | Técnicas WILD e MILD | Compartilhando minhas experiências e aprendizados',
    },
    {
        'nome_usuario': 'mariana.sonha',
        'nome_completo': 'Mariana Vasconcelos',
        'email': 'mariana.vasc@dreamshare.test',
        'bio': 'Mãe, professora e sonhadora 🌟 | Acredito que sonhos são mensagens que precisamos aprender a ler',
    },
    {
        'nome_usuario': 'pedrohmartins',
        'nome_completo': 'Pedro Henrique Martins',
        'email': 'pedro.martins@dreamshare.test',
        'bio': 'Estudante de Medicina 🩺 | Pesadelos frequentes desde a faculdade (será coincidência?) | Registro tudo aqui',
    },
    {
        'nome_usuario': 'juju_astral',
        'nome_completo': 'Juliana Correia',
        'email': 'juliana.correia@dreamshare.test',
        'bio': 'Espiritualista e curiosa 🔮 | Sonhos, tarot e autoconhecimento | Cada sonho é uma porta para dentro de si',
    },
    {
        'nome_usuario': 'lucas.rpg',
        'nome_completo': 'Lucas Almeida',
        'email': 'lucas.almeida@dreamshare.test',
        'bio': 'Nerd assumido 🎮 | Meus sonhos parecem cutscenes de RPG | Às vezes acordo e quero continuar a quest',
    },
    {
        'nome_usuario': 'bia_notivaga',
        'nome_completo': 'Beatriz Fonseca',
        'email': 'beatriz.fonseca@dreamshare.test',
        'bio': 'Insone crônica que pelo menos tem sonhos incríveis quando dorme 🌃 | Escritora | Meus livros nascem dos meus sonhos',
    },
    {
        'nome_usuario': 'andre.onirico',
        'nome_completo': 'André Cavalcanti',
        'email': 'andre.cavalcanti@dreamshare.test',
        'bio': 'Psicólogo junguiano 🧩 | A análise de sonhos mudou minha vida | Aqui compartilho os meus',
    },
    {
        'nome_usuario': 'fernanda_mp',
        'nome_completo': 'Fernanda Monteiro',
        'email': 'fernanda.monteiro@dreamshare.test',
        'bio': 'Musicista 🎵 | Já compus 3 músicas baseadas em melodias que ouvi dormindo | O inconsciente é o melhor compositor',
    },
    {
        'nome_usuario': 'davi_sleepwalker',
        'nome_completo': 'Davi Rezende',
        'email': 'davi.rezende@dreamshare.test',
        'bio': 'Sonâmbulo em recuperação 😅 | Minha família tem histórias absurdas sobre o que eu já fiz dormindo',
    },
    {
        'nome_usuario': 'carol_rj',
        'nome_completo': 'Carolina Ribeiro',
        'email': 'carolina.ribeiro@dreamshare.test',
        'bio': 'Carioca sonhadora 🏖️ | Meus sonhos geralmente envolvem o mar | Estudante de Oceanografia',
    },
]


# ============================================================
# REALISTIC COMMENTS
# ============================================================
COMMENTS = [
    # --- Empáticos ---
    "Caramba, passei por algo muito parecido. Essa sensação de acordar sem saber se foi real é a pior parte.",
    "Que lindo, de verdade. Acho que seu subconsciente tá te mandando uma mensagem importante. ❤️",
    "Te entendo perfeitamente. Já tive um sonho assim e fiquei o dia inteiro estranho.",
    "Que intenso! Cuida de você, tá? Sonhos assim pesam na alma.",
    "Nossa, me arrepiou inteira lendo isso. A parte da voz distorcida é perturbadora.",
    # --- Curiosos ---
    "Sério que isso aconteceu? Que bizarro! Você já pesquisou o que pode significar?",
    "Nunca ouvi falar de sonho duplo assim. Vou pesquisar sobre isso.",
    "Você pratica alguma técnica de sonho lúcido? Queria aprender!",
    "Mais alguém aqui tem uma cidade recorrente nos sonhos? A minha tem um shopping abandonado.",
    "Quantas vezes esse sonho já se repetiu? Se for mais de 3, vale a pena investigar.",
    # --- Companheirismo ---
    "Você não tá sozinha nisso. Esse sub é exatamente pra isso, compartilhar sem julgamento. 🫂",
    "Obrigado por dividir isso, de verdade. Me sinto menos maluco sabendo que outras pessoas têm experiências assim.",
    "Fico feliz que você postou. Guardar essas coisas pra si mesmo é muito pesado.",
    "A gente tá aqui! Qualquer coisa, pode postar sempre. ✨",
    # --- Analíticos ---
    "Na psicologia junguiana, sonhar com a casa da infância representa o self interior. Muito interessante a variação que você descreveu.",
    "Sonho de dentes caindo geralmente está relacionado à ansiedade sobre aparência ou medo de perder o controle. Se tá em época de prova, faz total sentido.",
    "Paralisia do sono é causada pela atonia muscular do REM. A sombra é alucinação hipnopômpica. Assustadora, mas inofensiva.",
    "Cores inexistentes durante o sonho são um fenômeno documentado! O córtex visual não está limitado ao espectro real quando não há input dos olhos.",
    "Sonhos premonitórios podem ser explicados por viés de confirmação, mas confesso que arrepia quando acontece.",
    # --- Engraçados ---
    "Seu subconsciente tem um senso de humor melhor que o meu kkkk 💀",
    "O cachorro de gravata me quebrou completamente KKKKKK",
    "Eu sendo condenado a moderar fórum seria meu inferno pessoal 😂",
    "O gato lendo jornal é a coisa mais gato possível. Eles realmente nos julgam.",
    "Silvio Santos como professor é peak subconsciente brasileiro",
    # --- Identificação ---
    "EU TBM PASSO A LÍNGUA NOS DENTES QUANDO ACORDO DESSES SONHOS. Pensei que era só eu kkkk",
    "A cidade dos sonhos! Eu tenho a minha! Ela tem um rio que corta o centro e uma ponte de pedra antiga.",
    "Mano, meu gato também me olha como se soubesse das coisas. Eu tenho certeza que eles sabem.",
    "Já tive paralisia do sono tantas vezes que agora quando acontece eu penso 'ah, de novo' e espero passar.",
    "Sonhei com enchente uma vez e choveu forte no dia seguinte. Não tão impressionante quanto o seu, mas ainda assim...",
    # --- Apoio ---
    "Força! Luto é um processo e não tem prazo. Se ele apareceu é porque você precisava. 💜",
    "Não se cobra. Sonhar com ex depois de muito tempo é completamente normal e não significa que você não superou.",
    "Vergonha de sonho é a coisa mais relatável que existe kkk. Relaxa, passa em uns dias.",
    "Que história intensa. Espero que você esteja bem. Estamos aqui. 🌙",
    "Se os sonhos de ansiedade estão muito frequentes, talvez valha conversar com alguém. Sem pressa, sem pressão. ❤️",
]


# ============================================================
# HASHTAGS
# ============================================================
HASHTAG_TEXTS = [
    'sonholucido', 'pesadelo', 'sonhorecorrente', 'voar', 'cair',
    'perseguicao', 'agua', 'animais', 'familia', 'viagem',
    'aventura', 'misterio', 'romance', 'terror', 'fantastica',
    'profecia', 'deja_vu', 'paralisia', 'cores', 'musica',
    'humor', 'bizarro', 'significado', 'saudade', 'ansiedade',
    'escola', 'premonitorio', 'realitycheck', 'constrangimento',
    'absurdo', 'classico', 'cosmos', 'famosos', 'dentes',
]


class Command(BaseCommand):
    help = 'Seed the database with realistic sample data for development'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding'
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            self.clear_data()
        
        self.stdout.write(self.style.WARNING(
            f'🌱 Starting seed with {len(USER_PROFILES)} users and {len(DREAM_POSTS)} posts...'
        ))
        
        users = self.create_users()
        hashtags = self.create_hashtags()
        posts = self.create_posts(users, hashtags)
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

    def create_users(self):
        """Create realistic user profiles"""
        from django.contrib.auth.hashers import make_password
        self.stdout.write('Creating users...')
        
        users = []
        for profile in USER_PROFILES:
            if Usuario.objects.filter(email=profile['email']).exists():
                users.append(Usuario.objects.get(email=profile['email']))
                continue
                
            user = Usuario.objects.create_user(
                email=profile['email'],
                nome_usuario=profile['nome_usuario'],
                nome_completo=profile['nome_completo'],
                password='teste123'
            )
            user.bio = profile['bio']
            user.data_criacao = timezone.now() - timedelta(days=random.randint(30, 365))
            pergunta = profile.get('pergunta_secreta')
            resposta = profile.get('resposta_secreta')
            if pergunta is not None and resposta:
                user.pergunta_secreta = pergunta
                user.resposta_secreta = make_password(resposta.strip().lower())
            user.save()
            users.append(user)
            
        self.stdout.write(f'  Created/found {len(users)} users')
        return users

    def create_hashtags(self):
        """Create hashtags for dream categorization"""
        self.stdout.write('Creating hashtags...')
        
        hashtags = {}
        for text in HASHTAG_TEXTS:
            hashtag, created = Hashtag.objects.get_or_create(
                texto_hashtag=text,
                defaults={'contagem_uso': 0}
            )
            hashtags[text] = hashtag
            
        self.stdout.write(f'  Created/found {len(hashtags)} hashtags')
        return hashtags

    def create_posts(self, users, hashtags):
        """Create realistic dream posts with proper hashtag associations"""
        self.stdout.write('Creating posts...')
        
        posts = []
        for i, dream in enumerate(DREAM_POSTS):
            # Distribute posts among users in a weighted way (some users post more)
            if i < 4:
                user = users[i % len(users)]
            else:
                user = random.choice(users)
            
            # Build hashtag text for the content
            post_hashtag_keys = dream.get('hashtags', [])
            hashtag_text = ' '.join([f'#{h}' for h in post_hashtag_keys])
            
            full_content = f"{dream['conteudo_texto']}\n\n{hashtag_text}"
            
            post = Publicacao.objects.create(
                usuario=user,
                titulo=dream['titulo'],
                conteudo_texto=full_content,
                tipo_sonho=dream.get('tipo_sonho', 'Normal'),
                emocoes_sentidas=dream.get('emocoes_sentidas', ''),
                visibilidade=random.choices([1, 2], weights=[0.85, 0.15])[0],
                data_publicacao=timezone.now() - timedelta(
                    days=random.randint(0, 45),
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59)
                )
            )
            
            # Create hashtag relationships
            for h_key in post_hashtag_keys:
                if h_key in hashtags:
                    PublicacaoHashtag.objects.create(
                        publicacao=post,
                        hashtag=hashtags[h_key]
                    )
                    hashtags[h_key].contagem_uso += 1
                    hashtags[h_key].save()
            
            posts.append(post)
            
        self.stdout.write(f'  Created {len(posts)} posts')
        return posts

    def create_follows(self, users):
        """Create organic follow relationships"""
        self.stdout.write('Creating follows...')
        
        follow_count = 0
        for user in users:
            # Each user follows 3-8 random other users
            others = [u for u in users if u != user]
            num_to_follow = min(random.randint(3, 8), len(others))
            to_follow = random.sample(others, k=num_to_follow)
            
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
        """Create likes with realistic distribution (some posts more popular)"""
        self.stdout.write('Creating likes...')
        
        like_count = 0
        for post in posts:
            # More emotional/relatable posts get more likes (20-80% of users)
            like_ratio = random.uniform(0.2, 0.8)
            num_likers = max(1, int(len(users) * like_ratio))
            likers = random.sample(users, k=min(num_likers, len(users)))
            
            for user in likers:
                reaction, created = ReacaoPublicacao.objects.get_or_create(
                    usuario=user,
                    publicacao=post
                )
                if created:
                    like_count += 1
                    
        self.stdout.write(f'  Created {like_count} likes')

    def create_comments(self, users, posts):
        """Create realistic comments with varied engagement"""
        self.stdout.write('Creating comments...')
        
        comment_count = 0
        for post in posts:
            # Each post gets 1-6 comments
            num_comments = random.randint(1, 6)
            # Self-commenting is intentionally excluded: users do not comment on their own posts in the seed data
            available_commenters = [u for u in users if u != post.usuario]
            commenters = random.sample(
                available_commenters,
                k=min(num_comments, len(available_commenters))
            )
            
            for user in commenters:
                comment_text = random.choice(COMMENTS)
                
                Comentario.objects.create(
                    usuario=user,
                    publicacao=post,
                    conteudo_texto=comment_text,
                    data_comentario=post.data_publicacao + timedelta(
                        hours=random.randint(1, 72),
                        minutes=random.randint(0, 59)
                    )
                )
                comment_count += 1
                
        self.stdout.write(f'  Created {comment_count} comments')

    def create_reports(self, users, posts):
        """Create a few sample reports for moderation testing"""
        self.stdout.write('Creating sample reports...')
        
        sample_posts = random.sample(posts, k=min(2, len(posts)))
        
        for post in sample_posts:
            reporter = random.choice([u for u in users if u != post.usuario])
            Denuncia.objects.create(
                usuario_denunciante=reporter,
                tipo_conteudo=1,
                id_conteudo=post.id_publicacao,
                motivo_denuncia=random.randint(1, 3),
                descricao_denuncia="Conteúdo reportado para teste de moderação.",
                status_denuncia=1
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
        self.stdout.write(f'  ❤️  Likes: {ReacaoPublicacao.objects.count()}')
        self.stdout.write(f'  #️⃣  Hashtags: {Hashtag.objects.count()}')
        self.stdout.write(f'  🚨 Reports: {Denuncia.objects.count()}')
        self.stdout.write('='*50)
        self.stdout.write(self.style.WARNING(
            '\n🔑 Test credentials: Any seeded user with password "teste123"'
        ))
        self.stdout.write(self.style.WARNING(
            '📧 Example login: luna.freitas@dreamshare.test / teste123'
        ))
