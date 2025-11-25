Escopo do Projeto: Dream Share (Nome provisório)

1. Visão Geral

O Dream Share é uma plataforma híbrida (Rede Social + Ferramenta de Self-Tracking) dedicada ao registro, análise e compartilhamento de experiências oníricas. O sistema atua como um "diário digital" que incentiva o hábito de registrar sonhos, promovendo autoconhecimento e interação comunitária baseada em relatos do subconsciente.

2. Objetivos
2.1. Objetivo Técnico (Acadêmico)
Demonstrar competência Full-Stack integrando:

API RESTful em Python (Django).

Banco de dados relacional.

Aplicação Mobile Nativa em Android (Kotlin) com uso de recursos de hardware (áudio/alarme).

Aplicação Web para gestão e visualização.

2.2. Objetivo de Negócio/Social

Melhoria Cognitiva e Mnemônica: Incentivar o exercício diário de rememoração (dream recall). Estudos indicam que o hábito de registrar sonhos ao acordar fortalece a memória de curto e longo prazo, treinando o cérebro a reter detalhes que normalmente seriam descartados pelo filtro de vigília.

Higiene do Sono: O aplicativo mobile incluirá ferramentas para um despertar menos traumático, facilitando a retenção das lembranças do sonho e reduzindo a ansiedade do despertar. 

Saúde Mental: Fornecer uma ferramenta para que usuários identifiquem padrões recorrentes (como pesadelos frequentes), o que pode servir de insumo para terapias psicológicas.

Comunidade: Espaço seguro para discussão e interpretação colaborativa de sonhos.

3. Justificativa Científica

A relevância do projeto se apoia na neurociência cognitiva. Durante o sono REM, o cérebro consolida memórias. No entanto, essas memórias oníricas são voláteis e se dissipam em minutos após o despertar. O Dream Share resolve o problema da "amnésia onírica" fornecendo uma interface rápida e acessível (Mobile) para a captura imediata desses dados, servindo como uma extensão digital da memória do usuário.

4. Stack Tecnológico
Back-end: Python 3 + Django + Django REST Framework (DRF).

Banco de Dados: PostgreSQL (Produção) / SQLite (Dev).

Mobile: Android Nativo (Kotlin) + Retrofit + AlarmManager/MediaPlayer.

Web: Interface Front-end consumindo a API.

Infraestrutura: GitHub Codespaces.

5. Requisitos Funcionais

5.1. Módulo de Usuário
Autenticação: Login, Cadastro e Logout.

Perfil: Foto, Biografia, Nome de exibição, Aba de posts.

5.2. Módulo de Sonhos (Core)
Postagem Rápida: Descrição (relato) podendo utilizar imagens, emojis, gifs e terá a data do sonho quando foi publicada.

Categorização Livre: Uso de hashtags (#) no corpo do texto ou campo específico para classificar o sonho (ex: #pesadelo, #lucido, #voando), permitindo busca futura.

Privacidade: Seletor de visibilidade (Público, Privado para sí ou só para os amigos) por postagem.

5.3. Módulo Social

Feed: Timeline cronológica de sonhos públicos tanto das pessoas que o usuário segue quanto das publicações que serão recomendadas pelo algoritmo, separadas por abas ("Seguindo" e "Para você", respectivamente).

Interação: Sistema de comentários e curtidas/reações.

Busca: Pesquisa por palavras-chave ou hashtags.

5.4. Funcionalidade Exclusiva Mobile (Diferencial)
Despertador Suave (Smart Alarm):

Função de alarme configurável pelo usuário.

Efeito Fade-in: O áudio inicia com volume mínimo e aumenta gradativamente durante um intervalo de tempo definido, simulando um despertar natural para preservar a memória do sonho.
