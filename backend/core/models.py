from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone

class UsuarioManager(BaseUserManager):
    def create_user(self, email, nome_usuario, nome_completo, password=None):
        if not email:
            raise ValueError('Usuários devem ter um endereço de email')
        if not nome_usuario:
            raise ValueError('Usuários devem ter um nome de usuário')

        user = self.model(
            email=self.normalize_email(email),
            nome_usuario=nome_usuario,
            nome_completo=nome_completo,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nome_usuario, nome_completo, password=None):
        user = self.create_user(
            email,
            password=password,
            nome_usuario=nome_usuario,
            nome_completo=nome_completo,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user

class Usuario(AbstractBaseUser):
    id_usuario = models.AutoField(primary_key=True)
    nome_usuario = models.CharField(max_length=50, unique=True)
    email = models.CharField(max_length=100, unique=True)
    # senha_hash is handled by AbstractBaseUser's password field
    nome_completo = models.CharField(max_length=100)
    bio = models.TextField(null=True, blank=True)
    avatar_url = models.CharField(max_length=255, null=True, blank=True)
    data_nascimento = models.DateField(null=True, blank=True)
    data_criacao = models.DateTimeField(default=timezone.now)
    verificado = models.BooleanField(default=False)
    
    STATUS_CHOICES = (
        (1, 'Ativo'),
        (2, 'Suspenso'),
        (3, 'Desativado'),
    )
    status = models.SmallIntegerField(choices=STATUS_CHOICES, default=1)
    
    PRIVACIDADE_CHOICES = (
        (1, 'Público'),
        (2, 'Privado'),
    )
    privacidade_padrao = models.SmallIntegerField(choices=PRIVACIDADE_CHOICES, default=1)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome_usuario', 'nome_completo']

    class Meta:
        db_table = 'usuarios'

    def __str__(self):
        return self.nome_usuario

class Seguidor(models.Model):
    id_seguidor = models.AutoField(primary_key=True)
    usuario_seguidor = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='seguindo', db_column='id_usuario_seguidor')
    usuario_seguido = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='seguidores', db_column='id_usuario_seguido')
    data_seguimento = models.DateTimeField(default=timezone.now)
    
    STATUS_CHOICES = (
        (1, 'Ativo'),
        (2, 'Bloqueado'),
    )
    status = models.SmallIntegerField(choices=STATUS_CHOICES, default=1)

    class Meta:
        db_table = 'seguidores'
        unique_together = ('usuario_seguidor', 'usuario_seguido')

class Publicacao(models.Model):
    id_publicacao = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='id_usuario')
    conteudo_texto = models.TextField()
    titulo = models.CharField(max_length=150, null=True, blank=True)
    data_sonho = models.DateField(null=True, blank=True)
    tipo_sonho = models.CharField(max_length=50, null=True, blank=True)
    data_publicacao = models.DateTimeField(default=timezone.now)
    editado = models.BooleanField(default=False)
    data_edicao = models.DateTimeField(null=True, blank=True)
    
    VISIBILIDADE_CHOICES = (
        (1, 'Público'),
        (2, 'Lista de Amigos'),
        (3, 'Privado'),
    )
    visibilidade = models.SmallIntegerField(choices=VISIBILIDADE_CHOICES, default=1)
    localizacao = models.CharField(max_length=100, null=True, blank=True)
    emocoes_sentidas = models.TextField(null=True, blank=True)
    views_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'publicacoes'

class MidiaPublicacao(models.Model):
    id_midia = models.AutoField(primary_key=True)
    publicacao = models.ForeignKey(Publicacao, on_delete=models.CASCADE, db_column='id_publicacao')
    
    TIPO_MIDIA_CHOICES = (
        (1, 'Imagem'),
        (2, 'Vídeo'),
        (3, 'GIF'),
        (4, 'Áudio'),
    )
    tipo_midia = models.SmallIntegerField(choices=TIPO_MIDIA_CHOICES)
    url_midia = models.CharField(max_length=255)
    descricao = models.TextField(null=True, blank=True)
    posicao_ordem = models.SmallIntegerField(default=0)
    data_upload = models.DateTimeField(default=timezone.now)
    tamanho_bytes = models.IntegerField(null=True, blank=True)
    largura = models.IntegerField(null=True, blank=True)
    altura = models.IntegerField(null=True, blank=True)
    duracao = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'midia_publicacoes'

class Hashtag(models.Model):
    id_hashtag = models.AutoField(primary_key=True)
    texto_hashtag = models.CharField(max_length=50, unique=True)
    contagem_uso = models.IntegerField(default=1)
    primeira_utilizacao = models.DateTimeField(default=timezone.now)
    ultima_utilizacao = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'hashtags'

class PublicacaoHashtag(models.Model):
    publicacao = models.ForeignKey(Publicacao, on_delete=models.CASCADE, db_column='id_publicacao')
    hashtag = models.ForeignKey(Hashtag, on_delete=models.CASCADE, db_column='id_hashtag')
    data_associacao = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'publicacao_hashtags'
        unique_together = ('publicacao', 'hashtag')

class Comentario(models.Model):
    id_comentario = models.AutoField(primary_key=True)
    publicacao = models.ForeignKey(Publicacao, on_delete=models.CASCADE, db_column='id_publicacao')
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='id_usuario')
    conteudo_texto = models.TextField()
    data_comentario = models.DateTimeField(default=timezone.now)
    editado = models.BooleanField(default=False)
    data_edicao = models.DateTimeField(null=True, blank=True)
    comentario_pai = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, db_column='id_comentario_pai', related_name='respostas')
    
    STATUS_CHOICES = (
        (1, 'Ativo'),
        (2, 'Removido'),
        (3, 'Denunciado'),
    )
    status = models.SmallIntegerField(choices=STATUS_CHOICES, default=1)

    class Meta:
        db_table = 'comentarios'

class ReacaoPublicacao(models.Model):
    id_reacao = models.AutoField(primary_key=True)
    publicacao = models.ForeignKey(Publicacao, on_delete=models.CASCADE, db_column='id_publicacao')
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='id_usuario')
    data_reacao = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'reacoes_publicacoes'
        unique_together = ('publicacao', 'usuario')

class ReacaoComentario(models.Model):
    id_reacao = models.AutoField(primary_key=True)
    comentario = models.ForeignKey(Comentario, on_delete=models.CASCADE, db_column='id_comentario')
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='id_usuario')
    
    TIPO_REACAO_CHOICES = (
        (1, 'Gostei'),
        (2, 'Amei'),
        (3, 'Confuso'),
        (4, 'Assustado'),
        (5, 'Relacionável'),
    )
    tipo_reacao = models.SmallIntegerField(choices=TIPO_REACAO_CHOICES)
    data_reacao = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'reacoes_comentarios'
        unique_together = ('comentario', 'usuario')

class ListaAmigosProximos(models.Model):
    id_lista = models.AutoField(primary_key=True)
    usuario_dono = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='id_usuario_dono')
    nome_lista = models.CharField(max_length=50, default='Amigos Próximos')
    data_criacao = models.DateTimeField(default=timezone.now)
    data_atualizacao = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'lista_amigos_proximos'

class MembroListaAmigos(models.Model):
    lista = models.ForeignKey(ListaAmigosProximos, on_delete=models.CASCADE, db_column='id_lista')
    usuario_membro = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='id_usuario_membro')
    data_adicao = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'membros_lista_amigos'
        unique_together = ('lista', 'usuario_membro')

class Notificacao(models.Model):
    id_notificacao = models.AutoField(primary_key=True)
    usuario_destino = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='notificacoes_recebidas', db_column='id_usuario_destino')
    usuario_origem = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='notificacoes_geradas', db_column='id_usuario_origem')
    
    TIPO_NOTIFICACAO_CHOICES = (
        (1, 'Nova Publicação'),
        (2, 'Comentário'),
        (3, 'Curtida'),
        (4, 'Seguidor Novo'),
    )
    tipo_notificacao = models.SmallIntegerField(choices=TIPO_NOTIFICACAO_CHOICES)
    id_referencia = models.IntegerField(null=True, blank=True)
    conteudo = models.TextField(null=True, blank=True)
    lida = models.BooleanField(default=False)
    data_criacao = models.DateTimeField(default=timezone.now)
    data_leitura = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'notificacoes'

class ElementoSonho(models.Model):
    id_elemento = models.AutoField(primary_key=True)
    nome_elemento = models.CharField(max_length=100)
    categoria = models.CharField(max_length=50, null=True, blank=True)
    descricao = models.TextField(null=True, blank=True)
    contagem_usos = models.IntegerField(default=1)

    class Meta:
        db_table = 'elementos_sonhos'

class PublicacaoElemento(models.Model):
    publicacao = models.ForeignKey(Publicacao, on_delete=models.CASCADE, db_column='id_publicacao')
    elemento = models.ForeignKey(ElementoSonho, on_delete=models.CASCADE, db_column='id_elemento')
    data_associacao = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'publicacao_elementos'
        unique_together = ('publicacao', 'elemento')

class MensagemDireta(models.Model):
    id_mensagem = models.AutoField(primary_key=True)
    usuario_remetente = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='mensagens_enviadas', db_column='id_usuario_remetente')
    usuario_destinatario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='mensagens_recebidas', db_column='id_usuario_destinatario')
    conteudo = models.TextField()
    data_envio = models.DateTimeField(default=timezone.now)
    lida = models.BooleanField(default=False)
    data_leitura = models.DateTimeField(null=True, blank=True)
    deletada_remetente = models.BooleanField(default=False)
    deletada_destinatario = models.BooleanField(default=False)

    class Meta:
        db_table = 'mensagens_diretas'

class Denuncia(models.Model):
    id_denuncia = models.AutoField(primary_key=True)
    usuario_denunciante = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='id_usuario_denunciante')
    
    TIPO_CONTEUDO_CHOICES = (
        (1, 'Publicação'),
        (2, 'Comentário'),
        (3, 'Usuário'),
    )
    tipo_conteudo = models.SmallIntegerField(choices=TIPO_CONTEUDO_CHOICES)
    id_conteudo = models.IntegerField()
    
    MOTIVO_DENUNCIA_CHOICES = (
        (1, 'Conteúdo Inadequado'),
        (2, 'Assédio'),
        (3, 'Spam'),
    )
    motivo_denuncia = models.SmallIntegerField(choices=MOTIVO_DENUNCIA_CHOICES)
    descricao_denuncia = models.TextField(null=True, blank=True)
    data_denuncia = models.DateTimeField(default=timezone.now)
    
    STATUS_DENUNCIA_CHOICES = (
        (1, 'Pendente'),
        (2, 'Analisada'),
        (3, 'Resolvida'),
    )
    status_denuncia = models.SmallIntegerField(choices=STATUS_DENUNCIA_CHOICES, default=1)
    data_resolucao = models.DateTimeField(null=True, blank=True)
    
    ACAO_TOMADA_CHOICES = (
        (1, 'Nenhuma'),
        (2, 'Removido'),
        (3, 'Usuário Suspenso'),
    )
    acao_tomada = models.SmallIntegerField(choices=ACAO_TOMADA_CHOICES, null=True, blank=True)

    class Meta:
        db_table = 'denuncias'

class EstatisticaSonho(models.Model):
    id_estatistica = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='id_usuario')
    total_sonhos = models.IntegerField(default=0)
    pesadelos_registrados = models.IntegerField(default=0)
    sonhos_lucidos_registrados = models.IntegerField(default=0)
    elementos_recorrentes_top = models.JSONField(null=True, blank=True)
    padrao_sono_medio = models.CharField(max_length=50, null=True, blank=True)
    ultimo_calculo = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'estatisticas_sonhos'

class ConfiguracaoUsuario(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True, db_column='id_usuario')
    notificacoes_novas_publicacoes = models.BooleanField(default=True)
    notificacoes_comentarios = models.BooleanField(default=True)
    notificacoes_seguidor_novo = models.BooleanField(default=True)
    notificacoes_reacoes = models.BooleanField(default=True)
    notificacoes_mensagens_diretas = models.BooleanField(default=True)
    
    TEMA_INTERFACE_CHOICES = (
        (1, 'Claro'),
        (2, 'Escuro'),
        (3, 'Sistema'),
    )
    tema_interface = models.SmallIntegerField(choices=TEMA_INTERFACE_CHOICES, default=1)
    idioma = models.CharField(max_length=10, default='pt-BR')
    mostrar_visualizacoes = models.BooleanField(default=True)
    ultima_atualizacao = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'configuracoes_usuario'
