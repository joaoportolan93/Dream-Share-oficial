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


# ============================================================
# REALISTIC USER PROFILES
# ============================================================
USER_PROFILES = [
    {
        'nome_usuario': 'luna_freitas',
        'nome_completo': 'Luna Freitas',
        'email': 'luna.freitas@dreamshare.test',
        'bio': 'Sonhadora lúcida desde os 14 🌙 | Estudante de Psicologia | Meus sonhos contam histórias que minha mente acordada não consegue',
    },
    {
        'nome_usuario': 'rafael_dreams',
        'nome_completo': 'Rafael Mendes',
        'email': 'rafael.mendes@dreamshare.test',
        'bio': 'Diário de sonhos desde 2022 📖 | Às vezes engraçados, às vezes aterrorizantes | Tento entender o que meu subconsciente quer dizer',
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
# REALISTIC DREAM POSTS (original content)
# ============================================================
DREAM_POSTS = [
    # ---- NIGHTMARES / INTENSE ----
    {
        'titulo': 'A casa da minha avó, mas completamente errada',
        'conteudo_texto': (
            'Acabei de acordar e preciso registrar isso antes que esqueça os detalhes.\n\n'
            'Eu estava na casa da minha avó, que faleceu ano passado. Era a mesma casa que eu '
            'conheci a vida toda, o mesmo portão azul, as mesmas plantas no jardim. Mas quando '
            'entrei, tudo estava... deslocado. A cozinha estava onde deveria ser o quarto, e '
            'de dentro do banheiro eu conseguia ver o céu, como se não tivesse teto.\n\n'
            'Minha avó apareceu na sala, sentada na cadeira de balanço dela, tricotando como '
            'sempre fazia. Eu fui abraçá-la e quando cheguei perto, ela olhou pra mim e disse '
            '"você não deveria estar aqui ainda". A voz não era dela. Era grave, distorcida, '
            'como se tivesse sido gravada e tocada em câmera lenta.\n\n'
            'Acordei com o coração disparado e as mãos suando. O cheiro de café que ela sempre '
            'fazia parecia estar no meu quarto. Fiquei uns 5 minutos sem conseguir distinguir '
            'se estava acordada de verdade ou se ainda estava sonhando.'
        ),
        'tipo_sonho': 'Pesadelo',
        'emocoes_sentidas': 'medo, saudade, confusão',
        'hashtags': ['pesadelo', 'familia', 'misterio'],
    },
    {
        'titulo': 'Perseguido por algo que eu nunca vi',
        'conteudo_texto': (
            'Esse sonho foi pesado. Eu estava correndo por uma rua que parecia o centro da '
            'minha cidade, mas completamente vazia. Tipo, sem nenhuma alma viva. As lojas '
            'estavam abertas, as luzes acesas, mas simplesmente não tinha ninguém.\n\n'
            'Eu sabia que tinha alguma coisa atrás de mim. Não vi o que era em nenhum momento, '
            'mas sentia uma presença absurda, como quando você sabe que alguém tá te olhando '
            'mas não consegue achar quem. Minhas pernas pesavam como chumbo e eu tentava '
            'gritar mas não saía som nenhum.\n\n'
            'O pior de tudo é que eu entrei em um prédio pra me esconder e quando fechei a '
            'porta, do outro lado do vidro tinha só escuridão. Não era a rua, não era nada. '
            'Apagou tudo. E eu acordei. Simples assim.\n\n'
            'A sensação de coração acelerado durou uns bons 10 minutos. Alguém mais tem '
            'esse tipo de sonho onde você corre mas nunca vê do que tá fugindo?'
        ),
        'tipo_sonho': 'Pesadelo',
        'emocoes_sentidas': 'terror, ansiedade, impotência',
        'hashtags': ['perseguicao', 'pesadelo', 'paralisia'],
    },
    {
        'titulo': 'Meus dentes quebrando em pedaços (de novo)',
        'conteudo_texto': (
            'Gente, de novo esse sonho dos dentes. Já é a terceira vez esse mês.\n\n'
            'Eu estava em algum lugar que parecia uma festa de família, todo mundo conversando '
            'normal, e de repente eu senti algo estranho na boca. Passei a língua nos dentes '
            'e eles estavam moles, igual dente de leite. Aí começaram a se desfazer, tipo '
            'areia. Eu cuspindo pedacinhos de dente na mão e ninguém ao redor percebia.\n\n'
            'Fui ao banheiro e quando olhei no espelho, minha boca estava cheia de sangue e '
            'os dentes caindo um atrás do outro. O espelho refletia meu rosto, mas o sorriso '
            'era de uma pessoa completamente diferente.\n\n'
            'Acordei passando a língua nos dentes pra ter certeza que estavam lá kkkkk. Sério, '
            'que significado tem isso? Estou em época de prova na faculdade, será que é '
            'ansiedade? Toda vez é horrível.'
        ),
        'tipo_sonho': 'Recorrente',
        'emocoes_sentidas': 'ansiedade, nojo, desespero',
        'hashtags': ['sonhorecorrente', 'pesadelo', 'dentes'],
    },

    # ---- LUCID DREAMS ----
    {
        'titulo': 'Consegui voar pela primeira vez no sonho lúcido!!',
        'conteudo_texto': (
            'GENTE EU TO TREMENDO ATÉ AGORA. Finalmente consegui ter um sonho lúcido de '
            'verdade depois de 4 meses praticando a técnica MILD.\n\n'
            'Eu estava num corredor comprido, tipo de hotel, e percebi que as portas não '
            'tinham números normais — eram símbolos estranhos. Aí bateu: "isso é um sonho". '
            'Fiz o teste do reality check (tentei enfiar o dedo na palma da mão) e ele '
            'ATRAVESSOU. A sensação foi bizarra, como enfiar a mão em gelatina morna.\n\n'
            'Lembrei de tentar voar, que era meu objetivo. Pulei e no começo fiquei flutuando '
            'a uns 30cm do chão, meio desajeitado tipo um balão kkkkk. Mas aí relaxei, parei '
            'de pensar e simplesmente... subi. Atravessei o teto do prédio e estava de noite, '
            'com as estrelas absurdamente próximas. Era como se eu pudesse tocar nelas.\n\n'
            'A sensação de liberdade foi tão intensa que eu comecei a chorar dentro do sonho. '
            'O vento no rosto era real, o frio da altitude era real. Durou uns 2 minutos '
            'antes de tudo ficar embaçado e eu acordar.\n\n'
            'Valeram cada dia desses 4 meses. Se alguém quiser dicas, chama que eu compartilho '
            'o meu processo!'
        ),
        'tipo_sonho': 'Lúcido',
        'emocoes_sentidas': 'euforia, liberdade, emoção',
        'hashtags': ['sonholucido', 'voar', 'realitycheck'],
    },
    {
        'titulo': 'Dois sonhos ao mesmo tempo — como isso é possível?',
        'conteudo_texto': (
            'Ok isso foi de longe a coisa mais estranha que já me aconteceu dormindo.\n\n'
            'Estava tirando um cochilo à tarde (que é quando mais tenho sonhos lúcidos). '
            'Eu estava consciente de que estava sonhando — no sonho, eu estava numa praia '
            'com areia roxa e o mar era verde-limão, completamente surreal.\n\n'
            'Ao MESMO TEMPO, eu comecei a ouvir uma conversa na cozinha da minha casa. '
            'Minha mãe discutindo com meu irmão sobre o almoço. Eu ouvia tudo perfeitamente: '
            'o barulho dos pratos, a panela de pressão, minha mãe reclamando que ninguém '
            'ajuda em casa.\n\n'
            'Mas eu SABIA que estava dormindo. Tinha a praia surreal na frente dos meus olhos '
            'e a conversa da cozinha nos ouvidos. Quando acordei, fui perguntar se tinham '
            'brigado e... nada. Minha mãe tava assistindo novela quietinha. Meu irmão nem '
            'estava em casa.\n\n'
            'Ou seja: eu inventei a conversa inteira. Dois sonhos simultâneos, um visual e '
            'um auditivo. A voz da minha mãe era perfeita, até a entonação irritada kkkk. '
            'Alguém já teve isso?'
        ),
        'tipo_sonho': 'Lúcido',
        'emocoes_sentidas': 'confusão, espanto, curiosidade',
        'hashtags': ['sonholucido', 'paralisia', 'misterio'],
    },
    {
        'titulo': 'Controlando o sonho como um videogame',
        'conteudo_texto': (
            'Ontem tive meu segundo sonho lúcido e dessa vez consegui controlar mais coisas.\n\n'
            'Percebi que estava sonhando quando vi meu cachorro (que é um golden) andando em '
            'pé e usando gravata. Nesse momento pensei "ah não, de novo não" e fiz o reality '
            'check. Confirmado: sonho.\n\n'
            'Dessa vez tentei mudar o ambiente. Pensei forte em uma floresta e aos poucos, '
            'as paredes do meu quarto foram se transformando em árvores. O teto virou céu. '
            'O chão virou terra com folhas secas que eu ouvia crocando sob os pés.\n\n'
            'Tentei materializar uma espada (sim, eu sou nerd) e funcionou parcialmente — '
            'apareceu uma faca de cozinha na minha mão kkkk aparentemente meu subconsciente '
            'não é muito bom com detalhes.\n\n'
            'A parte mais legal foi que consegui prolongar o sonho por bastante tempo. '
            'Toda vez que sentia as coisas ficando embaçadas, eu olhava pras minhas mãos '
            'e focava nos detalhes dos dedos. Isso estabilizava tudo. Dica que aprendi no '
            'sub e realmente funciona!'
        ),
        'tipo_sonho': 'Lúcido',
        'emocoes_sentidas': 'diversão, controle, empolgação',
        'hashtags': ['sonholucido', 'aventura', 'realitycheck'],
    },

    # ---- EMOTIONAL / PERSONAL ----
    {
        'titulo': 'Sonhei com ela depois de 2 anos',
        'conteudo_texto': (
            'Não costumo postar essas coisas, mas preciso falar com alguém.\n\n'
            'Faz dois anos que terminei um relacionamento que durou 5 anos. Já segui em '
            'frente, ou pelo menos achava que sim. Essa noite sonhei com ela.\n\n'
            'Estávamos na mesma praça onde costumávamos ir no começo do namoro. Ela estava '
            'sentada no mesmo banco de sempre, lendo um livro. Eu sentei do lado e a gente '
            'simplesmente começou a conversar. Sobre nada específico. Sobre como o dia tava '
            'bonito, sobre um cachorro que passou. Natural, como se nunca tivéssemos '
            'terminado.\n\n'
            'No final do sonho, ela olhou pra mim e disse "tá tudo bem, a gente precisava '
            'disso". E sorriu daquele jeito que... enfim.\n\n'
            'Acordei com uma paz estranha. Não sei se estou triste ou aliviado. Parece que '
            'meu subconsciente finalmente fez o encerramento que a gente nunca teve na vida '
            'real. Desculpa o desabafo.'
        ),
        'tipo_sonho': 'Normal',
        'emocoes_sentidas': 'nostalgia, paz, saudade',
        'hashtags': ['romance', 'saudade', 'significado'],
    },
    {
        'titulo': 'Meu avô apareceu pra me dar um conselho',
        'conteudo_texto': (
            'Meu avô faleceu há 6 meses e ontem ele apareceu no meu sonho. Sei que muita '
            'gente vai achar que é "só um sonho", mas pra mim foi muito significativo.\n\n'
            'Eu estava numa versão diferente do sítio dele. As árvores eram mais altas, o '
            'rio que passava no fundo da propriedade estava com a água cristalina de um jeito '
            'que nunca vi na vida real. Ele estava sentado na varanda, no mesmo banquinho de '
            'madeira onde ele sempre sentava pra tomar café às 5 da manhã.\n\n'
            'Olhou pra mim, tranquilo como sempre, e disse: "para de se preocupar com o que '
            'os outros acham. Eu passei 70 anos vivendo pelo olhar dos vizinhos e perdi tempo '
            'demais fazendo isso."\n\n'
            'Veio na hora certa. Estou passando por uma fase de muita insegurança profissional '
            'e a opinião dos outros tem me sufocado. Sinto que ele veio falar comigo de verdade. '
            'Pode ser só o meu subconsciente processando o luto, mas foi reconfortante demais.\n\n'
            'Saudade, vô. ❤️'
        ),
        'tipo_sonho': 'Normal',
        'emocoes_sentidas': 'saudade, conforto, gratidão',
        'hashtags': ['familia', 'significado', 'saudade'],
    },
    {
        'titulo': 'Sonhei com alguém que conheço e agora tá estranho',
        'conteudo_texto': (
            'Socorro, sonhei com um colega de trabalho e agora não consigo olhar na cara dele.\n\n'
            'No sonho a gente estava numa viagem de trabalho (isso nunca aconteceu na vida '
            'real) e acabou ficando preso no aeroporto por causa de uma tempestade. A gente '
            'ficou conversando horas sobre a vida, coisa que nunca fizemos de verdade, e no '
            'sonho eu sentia que ele era a pessoa mais interessante do mundo.\n\n'
            'Nem vou entrar em mais detalhes porque me dá vergonha, mas agora toda vez que '
            'ele passa na minha mesa eu lembro do sonho e fico vermelha.\n\n'
            'Mente, por que você faz isso comigo? 😭 Alguém mais fica constrangido na vida '
            'real por causa de sonho?'
        ),
        'tipo_sonho': 'Normal',
        'emocoes_sentidas': 'vergonha, confusão, timidez',
        'hashtags': ['romance', 'constrangimento', 'sonhorecorrente'],
    },

    # ---- SURREAL / BIZARRE ----
    {
        'titulo': 'Sonhei que fui preso por usar a rede social errada kkkk',
        'conteudo_texto': (
            'Mano, eu preciso compartilhar isso porque é bizarro demais.\n\n'
            'Eu tava de boa no sofá no sonho, rolando o feed, aí recebo uma notificação: '
            '"Seu comentário violou as leis da internet, compareça à delegacia em 30 minutos."\n\n'
            'Eu fiquei tipo ??? O que eu fiz??? Fui ver o comentário e era literalmente '
            '"legal, gostei do post". SÓ ISSO. Aí apareceram dois policiais na porta da '
            'minha casa com um mandado de busca especificamente para o meu celular.\n\n'
            'O mais absurdo: no julgamento (sim, teve julgamento), o juiz era meu professor '
            'de matemática do ensino médio e ele me condenou a "100 horas de serviço '
            'comunitário como moderador de fórum".\n\n'
            'Acordei rindo sozinho. Meu subconsciente é comediante. 💀'
        ),
        'tipo_sonho': 'Normal',
        'emocoes_sentidas': 'diversão, absurdo, confusão',
        'hashtags': ['bizarro', 'humor', 'absurdo'],
    },
    {
        'titulo': 'O supermercado infinito',
        'conteudo_texto': (
            'Sonhei que fui fazer uma comprinha rápida no mercado. O lugar parecia normal '
            'no começo, mas toda vez que eu achava o corredor da saída, ele virava outro '
            'corredor de produtos. Eu andava e andava e o mercado ia se expandindo.\n\n'
            'Os corredores foram ficando cada vez mais bizarros. O primeiro tinha produtos '
            'normais, arroz, feijão. O segundo tinha roupas. O terceiro tinha móveis em '
            'tamanho real. O quarto tinha... barcos? Tipo, lanchas de verdade dentro de '
            'um supermercado.\n\n'
            'No corredor número sei-lá-quanto, eu achei um corredor de portas. Sim, portas. '
            'Portas de todos os tipos penduradas nas prateleiras. Abri uma e dava pra uma '
            'praia. Abri outra e dava pro meu quarto. Abri uma terceira e várias borboletas '
            'luminosas saíram voando.\n\n'
            'Nunca encontrei a saída. Acordei com a sensação esquisita de que ainda não saí '
            'de lá. Vou pensar duas vezes antes de ir no mercado hoje 😂'
        ),
        'tipo_sonho': 'Normal',
        'emocoes_sentidas': 'curiosidade, ansiedade leve, diversão',
        'hashtags': ['bizarro', 'misterio', 'aventura'],
    },
    {
        'titulo': 'A Lua caiu e ninguém ligou',
        'conteudo_texto': (
            'Ok, esse sonho foi cinematográfico.\n\n'
            'Eu estava no quintal de casa olhando pro céu à noite quando a Lua simplesmente '
            'começou a cair. Tipo, devagar, como uma bola de basquete caindo em câmera lenta. '
            'Eu via ela ficando cada vez maior no céu e achei que o mundo ia acabar.\n\n'
            'Mas ela pousou suavemente no oceano, lá longe no horizonte. Fez um splash enorme '
            'e gigantesco, mas a água não chegou até onde eu estava. E o mais surreal: ninguém '
            'ao redor deu bola. Meus vizinhos continuaram fazendo churrasco como se nada '
            'tivesse acontecido.\n\n'
            'Eu ficava gritando "a Lua caiu!! A LUA caiu!" e todo mundo respondia "ah, é '
            'assim mesmo, relaxa". A naturalidade das pessoas diante do absurdo me deixou '
            'mais perturbado do que a própria Lua caindo.\n\n'
            'Sonhos assim me fazem questionar tudo sobre como minha cabeça funciona.'
        ),
        'tipo_sonho': 'Normal',
        'emocoes_sentidas': 'espanto, frustração, maravilhamento',
        'hashtags': ['fantastica', 'bizarro', 'cosmos'],
    },
    {
        'titulo': 'Meu gato falando português fluente',
        'conteudo_texto': (
            'Sonhei que meu gato (Mingau, 4 anos, gordo e preguiçoso) me acordou miando '
            'diferente. Quando abri os olhos, ele olhou pra mim e disse, bem articulado: '
            '"você esqueceu de comprar a ração premium, né?"\n\n'
            'A NATURALIDADE com que eu reagi dentro do sonho é o que me assusta. Eu respondi '
            '"desculpa, Ming, amanhã eu compro". Como se fosse perfeitamente normal meu gato '
            'falar.\n\n'
            'Depois disso ele subiu na mesa e começou a ler o jornal (???) e me criticou por '
            'pedir pizza de novo em vez de cozinhar. Eu me senti genuinamente julgado pelo '
            'meu gato no sonho.\n\n'
            'Acordei e o Mingau real tava dormindo na minha cara, literalmente em cima do '
            'meu rosto. Coincidência? Acho que não. Ele sabe. 😼'
        ),
        'tipo_sonho': 'Normal',
        'emocoes_sentidas': 'diversão, carinho, absurdo',
        'hashtags': ['animais', 'humor', 'bizarro'],
    },

    # ---- PREMONITORY / SPIRITUAL ----
    {
        'titulo': 'Sonhei com uma enchente 3 dias antes de acontecer',
        'conteudo_texto': (
            'Não sei se existe explicação racional pra isso, mas preciso registrar.\n\n'
            'Sexta-feira passada sonhei com a rua da minha tia completamente alagada. Via '
            'a água subindo pelas paredes da casa dela e os móveis flutuando. Era uma chuva '
            'absurda e eu tentava chegar lá mas a corrente me empurrava.\n\n'
            'Segunda-feira, ou seja, 3 dias depois, uma chuva forte alagou justamente aquele '
            'bairro. A rua da minha tia ficou debaixo d\'água. Ela perdeu sofá, geladeira, '
            'várias coisas. Felizmente está bem, mas fiquei abalada.\n\n'
            'Não é a primeira vez que sonho com algo que acontece depois. Já sonhei com a '
            'demissão de um primo antes de ele saber, e com uma briga familiar que aconteceu '
            'na semana seguinte nos mesmos detalhes.\n\n'
            'Não sei o que pensar. Coincidência? Intuição? Alguém mais tem experiências assim?'
        ),
        'tipo_sonho': 'Normal',
        'emocoes_sentidas': 'medo, espanto, ansiedade',
        'hashtags': ['profecia', 'premonitorio', 'misterio'],
    },
    {
        'titulo': 'Vi cores que não existem na vida real',
        'conteudo_texto': (
            'Esse é difícil de descrever porque literalmente não existem palavras pra isso.\n\n'
            'No sonho eu entrei numa caverna que tinha cristais nas paredes. Até aí normal. '
            'Mas os cristais emitiam cores que eu NUNCA vi na vida real. Não era roxo, não '
            'era azul, não era nenhuma cor que eu conheço. Era algo completamente novo, como '
            'se meu cérebro tivesse inventado um comprimento de onda que não existe.\n\n'
            'Eu ficava olhando fascinada e tentando "memorizar" a cor pra lembrar quando '
            'acordasse, mas é claro que quando abri os olhos perdi completamente. Ficou '
            'só a sensação de que vi algo impossível.\n\n'
            'Li que o cérebro pode simular cores inexistentes durante o sono porque não está '
            'limitado pelo espectro visível real. Não sei se é verdade, mas faz sentido.\n\n'
            'Alguém já teve essa experiência? De ver uma cor em sonho que simplesmente '
            'não existe no mundo real?'
        ),
        'tipo_sonho': 'Normal',
        'emocoes_sentidas': 'fascinação, frustração, maravilhamento',
        'hashtags': ['cores', 'misterio', 'fantastica'],
    },

    # ---- ANXIETY / COMMON ----
    {
        'titulo': 'Cheguei atrasado na prova e ela era em mandarim',
        'conteudo_texto': (
            'O clássico sonho de ansiedade de estudante, mas com um twist.\n\n'
            'Sonhei que cheguei atrasado pra prova final da faculdade. A sala estava lotada '
            'e todo mundo já estava escrevendo. O professor (que por alguma razão era o '
            'Silvio Santos???) me olhou com decepção e entregou a prova.\n\n'
            'Quando abri... era tudo em mandarim. Ideogramas chineses, de cima a baixo. '
            'Eu não falo mandarim. Olhei pro lado e todo mundo escrevendo tranquilamente, '
            'tipo, respondendo as questões em mandarim como se fosse a coisa mais natural.\n\n'
            'Levantei a mão e perguntei "professor, isso é em chinês?" e ele respondeu: '
            '"não, é a matéria do semestre. Você deveria ter estudado."\n\n'
            'A angústia foi tão real que quando acordei genuinamente verifiquei se eu tinha '
            'alguma prova hoje. É terça-feira às 4 da manhã. Obrigado, cérebro. 🙃'
        ),
        'tipo_sonho': 'Normal',
        'emocoes_sentidas': 'ansiedade, pânico, confusão',
        'hashtags': ['ansiedade', 'escola', 'humor'],
    },
    {
        'titulo': 'Apresentação de trabalho sem roupa (mas ninguém notou)',
        'conteudo_texto': (
            'Acho que todo mundo já teve esse sonho em alguma variação, mas a minha foi única.\n\n'
            'Eu estava apresentando meu TCC pra banca, super preparada, slides bonitos, '
            'tudo perfeito. Só que eu estava de pijama. Não, pera. Eu estava de FANTASIA DE '
            'DINOSSAURO. Daquelas infláveis, verde.\n\n'
            'E ninguém falou nada. A banca anotava, fazia perguntas sérias sobre metodologia '
            'enquanto eu estava vestida de T-Rex tentando apontar pro slide com aqueles '
            'bracinhos pequenos da fantasia.\n\n'
            'No final, o orientador disse que minha apresentação foi "impecável" e me deu '
            'nota 10. Eu agradeci, tirei a cabeça de dinossauro e fui embora.\n\n'
            'Acordei rindo MUITO. Talvez meu subconsciente esteja me dizendo que eu me '
            'preocupo demais com a opinião dos outros na defesa do TCC. Ou talvez ele só '
            'queira me ver vestida de dinossauro. Quem sabe. 🦕'
        ),
        'tipo_sonho': 'Normal',
        'emocoes_sentidas': 'vergonha, diversão, alívio',
        'hashtags': ['ansiedade', 'humor', 'escola'],
    },
    {
        'titulo': 'Andando por uma cidade que não existe mas que eu conheço perfeitamente',
        'conteudo_texto': (
            'Vocês têm aquela cidade nos sonhos? Tipo, um lugar que não existe na vida real '
            'mas que aparece frequentemente e vocês sabem exatamente onde fica cada coisa?\n\n'
            'No meu sonho tem essa cidade litorânea que volta sempre. Tem uma avenida '
            'principal com palmeiras, um farol vermelho perto de uma praça, e um beco que '
            'leva a uma padaria antiga. Eu sei onde estão as ruas, os atalhos, tudo.\n\n'
            'Essa noite voltei lá. Fui pela avenida principal até o farol, desci pras pedras '
            'da praia e fiquei sentado olhando o mar. A água era mais escura que o normal e '
            'as ondas faziam um barulho diferente, meio metálico.\n\n'
            'O mais estranho é que toda vez que vou a essa cidade no sonho, ela está um '
            'pouquinho diferente. Dessa vez tinha um prédio novo perto do farol que não '
            'estava lá antes. Como se a cidade estivesse "crescendo" sozinha entre os meus '
            'sonhos.\n\n'
            'Alguém mais tem uma cidade recorrente que parece ter vida própria?'
        ),
        'tipo_sonho': 'Recorrente',
        'emocoes_sentidas': 'familiaridade, nostalgia, curiosidade',
        'hashtags': ['sonhorecorrente', 'viagem', 'misterio'],
    },
    {
        'titulo': 'Paralisia do sono com sombra no quarto',
        'conteudo_texto': (
            'Preciso colocar pra fora porque não consigo dormir de novo depois disso.\n\n'
            'Acordei sem conseguir mexer o corpo. Estava deitado de barriga pra cima (que é '
            'a posição que mais me faz ter paralisia). Meus olhos estavam meio abertos e eu '
            'via o meu quarto real — a porta, o armário, a luz do corredor entrando por baixo '
            'da porta.\n\n'
            'Aí percebi uma forma no canto do quarto. Era como uma pessoa, mas sem rosto, '
            'sem detalhes. Apenas uma silhueta escura, mais escura que a escuridão ao redor. '
            'Ela ficou parada ali, e eu sabia que ela estava me observando mesmo sem ter olhos.\n\n'
            'Tentei gritar, mas nada saía. Tentei mexer um dedo, nada. Parecia que alguém '
            'tinha colado meu corpo no colchão. Durou talvez 30 segundos, mas pareceram '
            '10 minutos. A sombra se dissipou e eu finalmente consegui virar de lado.\n\n'
            'Tô com a luz acesa agora. São 3:47 da manhã. Não volto a dormir hoje. '
            'Quem tem paralisia do sono sabe o terror que é.'
        ),
        'tipo_sonho': 'Pesadelo',
        'emocoes_sentidas': 'terror, impotência, desespero',
        'hashtags': ['paralisia', 'pesadelo', 'terror'],
    },
    {
        'titulo': 'Sonhei que encontrei um quarto secreto na minha casa',
        'conteudo_texto': (
            'Moro nessa casa há 15 anos e no sonho descobri que tinha um quarto que nunca vi.\n\n'
            'Estava no corredor e notei uma porta que não deveria estar ali, entre o banheiro '
            'e o quarto de hóspedes. Abri e era um cômodo enorme, maior do que deveria caber '
            'no espaço físico da casa. Tinha estantes cheias de livros velhos, uma escrivaninha '
            'com cartas amareladas e uma janela que dava pra um jardim que não existe.\n\n'
            'A poeira era grossa e tudo parecia intocado por anos. Peguei uma das cartas e '
            'estava endereçada a mim, com a minha letra. Mas não lembro do conteúdo — ele '
            'mudava toda vez que eu tentava ler.\n\n'
            'A sensação de "como eu nunca reparei nesse quarto?" era absurdamente real. '
            'Quando acordei, fui verificar o corredor. Obviamente não tinha porta nenhuma. '
            'Mas fiquei com aquela sensação de que estou perdendo algo debaixo do meu nariz.\n\n'
            'Li que sonhar com quartos secretos simboliza partes desconhecidas de nós mesmos. '
            'Faz algum sentido no momento que tô vivendo.'
        ),
        'tipo_sonho': 'Normal',
        'emocoes_sentidas': 'curiosidade, mistério, fascinação',
        'hashtags': ['misterio', 'significado', 'deja_vu'],
    },

    # ---- SHORT / CASUAL ----
    {
        'titulo': 'Breve mas marcante',
        'conteudo_texto': (
            'Sonho curto, mas que me impactou.\n\n'
            'Eu estava numa varanda olhando pro pôr do sol com alguém que eu não reconhecia. '
            'A pessoa segurava minha mão e disse "a gente vai ficar bem". Só isso.\n\n'
            'Acordei com uma paz absurda. O tipo de sonho que muda teu dia inteiro. ☀️'
        ),
        'tipo_sonho': 'Normal',
        'emocoes_sentidas': 'paz, esperança, conforto',
        'hashtags': ['romance', 'significado'],
    },
    {
        'titulo': 'Sonhei que tava caindo e acordei pulando na cama',
        'conteudo_texto': (
            'Aquela clássica. Tava andando na calçada de boa, tropecei no meio fio e comecei '
            'a cair. O tropeço durou tipo 3 segundos no sonho mas meu corpo INTEIRO se '
            'sacudiu na cama e acordei com o coração na garganta.\n\n'
            'Minha namorada quase teve um infarto do meu lado kkkk ela achou que eu tava '
            'tendo uma convulsão. São 2 da manhã e agora ninguém consegue dormir.\n\n'
            'Obrigado, cérebro. Trabalho excelente como sempre. 👏'
        ),
        'tipo_sonho': 'Normal',
        'emocoes_sentidas': 'susto, vergonha, humor',
        'hashtags': ['cair', 'humor', 'classico'],
    },
    {
        'titulo': 'O sonho que todos pensam que só acontece com eles',
        'conteudo_texto': (
            'Sonhou que tava fazendo xixi e acordou... fazendo xixi? Não, graças a Deus não '
            'cheguei nesse ponto. MAS quase.\n\n'
            'No sonho eu estava num banheiro público (daqueles horríveis) procurando um '
            'vaso que funcionasse. Eram tipo 50 banheiros e todos tinham algum problema: '
            'sem porta, sem privada, alagado, ou simplesmente não existia o vaso — só o '
            'chão.\n\n'
            'Minha bexiga mandando sinais REAIS pro meu cérebro e meu sonho interpretando '
            'isso da pior forma possível.\n\n'
            'Acordei correndo pro banheiro de verdade. Um alívio. Literalmente. 😂'
        ),
        'tipo_sonho': 'Normal',
        'emocoes_sentidas': 'urgência, diversão, alívio',
        'hashtags': ['humor', 'classico', 'bizarro'],
    },
    {
        'titulo': 'Cozinhando com Gordon Ramsay no meu sonho',
        'conteudo_texto': (
            'HAHAHA preciso contar esse.\n\n'
            'Sonhei que participei do MasterChef, mas o Gordon Ramsay era meu parceiro de '
            'equipe. Ele gritava comigo em inglês e eu respondia em português e a gente se '
            'entendia perfeitamente mesmo falando idiomas diferentes.\n\n'
            'A gente tinha que fazer um risoto e ele ficou FURIOSO porque eu coloquei ketchup. '
            '"WHAT ARE YOU DOING?!" e eu "calma, chef, confia no processo". No final nosso '
            'prato ganhou e ele chorou de emoção.\n\n'
            'Depois acordei com fome e pedi um lanche. A ironia. 🍔'
        ),
        'tipo_sonho': 'Normal',
        'emocoes_sentidas': 'diversão, absurdo, fome',
        'hashtags': ['humor', 'bizarro', 'famosos'],
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
