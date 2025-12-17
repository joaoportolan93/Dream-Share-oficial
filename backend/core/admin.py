from django.contrib import admin
from django.utils import timezone
from .models import (
    Usuario, Publicacao, Comentario, Seguidor, Hashtag, 
    Notificacao, Denuncia, PublicacaoHashtag, ReacaoPublicacao,
    MidiaPublicacao, ElementoSonho, ConfiguracaoUsuario
)


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('id_usuario', 'nome_usuario', 'email', 'status', 'verificado', 'data_criacao')
    list_filter = ('status', 'verificado', 'privacidade_padrao')
    search_fields = ('nome_usuario', 'email', 'nome_completo')
    ordering = ('-data_criacao',)
    readonly_fields = ('id_usuario', 'data_criacao')
    
    actions = ['suspender_usuarios', 'ativar_usuarios']
    
    @admin.action(description='Suspender usuários selecionados')
    def suspender_usuarios(self, request, queryset):
        updated = queryset.update(status=2)
        self.message_user(request, f'{updated} usuário(s) suspenso(s) com sucesso.')
    
    @admin.action(description='Ativar usuários selecionados')
    def ativar_usuarios(self, request, queryset):
        updated = queryset.update(status=1)
        self.message_user(request, f'{updated} usuário(s) ativado(s) com sucesso.')


@admin.register(Publicacao)
class PublicacaoAdmin(admin.ModelAdmin):
    list_display = ('id_publicacao', 'usuario', 'titulo', 'visibilidade', 'tipo_sonho', 'data_publicacao')
    list_filter = ('visibilidade', 'tipo_sonho', 'editado')
    search_fields = ('conteudo_texto', 'titulo', 'usuario__nome_usuario')
    ordering = ('-data_publicacao',)
    readonly_fields = ('id_publicacao', 'data_publicacao')
    raw_id_fields = ('usuario',)
    
    actions = ['remover_publicacoes']
    
    @admin.action(description='Remover publicações selecionadas')
    def remover_publicacoes(self, request, queryset):
        count = queryset.count()
        queryset.delete()
        self.message_user(request, f'{count} publicação(ões) removida(s) com sucesso.')


@admin.register(Comentario)
class ComentarioAdmin(admin.ModelAdmin):
    list_display = ('id_comentario', 'usuario', 'publicacao', 'status', 'data_comentario')
    list_filter = ('status', 'editado')
    search_fields = ('conteudo_texto', 'usuario__nome_usuario')
    ordering = ('-data_comentario',)
    readonly_fields = ('id_comentario', 'data_comentario')
    raw_id_fields = ('usuario', 'publicacao', 'comentario_pai')
    
    actions = ['marcar_como_removido']
    
    @admin.action(description='Marcar comentários como removidos')
    def marcar_como_removido(self, request, queryset):
        updated = queryset.update(status=2)
        self.message_user(request, f'{updated} comentário(s) marcado(s) como removido(s).')


@admin.register(Seguidor)
class SeguidorAdmin(admin.ModelAdmin):
    list_display = ('id_seguidor', 'usuario_seguidor', 'usuario_seguido', 'status', 'data_seguimento')
    list_filter = ('status',)
    search_fields = ('usuario_seguidor__nome_usuario', 'usuario_seguido__nome_usuario')
    ordering = ('-data_seguimento',)
    raw_id_fields = ('usuario_seguidor', 'usuario_seguido')


@admin.register(Hashtag)
class HashtagAdmin(admin.ModelAdmin):
    list_display = ('id_hashtag', 'texto_hashtag', 'contagem_uso', 'primeira_utilizacao', 'ultima_utilizacao')
    search_fields = ('texto_hashtag',)
    ordering = ('-contagem_uso',)
    readonly_fields = ('id_hashtag', 'primeira_utilizacao')


@admin.register(Notificacao)
class NotificacaoAdmin(admin.ModelAdmin):
    list_display = ('id_notificacao', 'usuario_destino', 'usuario_origem', 'tipo_notificacao', 'lida', 'data_criacao')
    list_filter = ('tipo_notificacao', 'lida')
    search_fields = ('usuario_destino__nome_usuario', 'usuario_origem__nome_usuario', 'conteudo')
    ordering = ('-data_criacao',)
    readonly_fields = ('id_notificacao', 'data_criacao')
    raw_id_fields = ('usuario_destino', 'usuario_origem')


@admin.register(Denuncia)
class DenunciaAdmin(admin.ModelAdmin):
    list_display = ('id_denuncia', 'usuario_denunciante', 'tipo_conteudo', 'motivo_denuncia', 'status_denuncia', 'data_denuncia')
    list_filter = ('status_denuncia', 'motivo_denuncia', 'tipo_conteudo')
    search_fields = ('usuario_denunciante__nome_usuario', 'descricao_denuncia')
    ordering = ('-data_denuncia',)
    readonly_fields = ('id_denuncia', 'data_denuncia')
    raw_id_fields = ('usuario_denunciante',)
    
    actions = ['marcar_como_resolvida', 'marcar_como_analisada']
    
    @admin.action(description='Marcar denúncias como resolvidas')
    def marcar_como_resolvida(self, request, queryset):
        updated = queryset.update(status_denuncia=3, data_resolucao=timezone.now())
        self.message_user(request, f'{updated} denúncia(s) marcada(s) como resolvida(s).')
    
    @admin.action(description='Marcar denúncias como analisadas')
    def marcar_como_analisada(self, request, queryset):
        updated = queryset.update(status_denuncia=2)
        self.message_user(request, f'{updated} denúncia(s) marcada(s) como analisada(s).')


@admin.register(PublicacaoHashtag)
class PublicacaoHashtagAdmin(admin.ModelAdmin):
    list_display = ('publicacao', 'hashtag', 'data_associacao')
    search_fields = ('publicacao__titulo', 'hashtag__texto_hashtag')
    raw_id_fields = ('publicacao', 'hashtag')


@admin.register(ReacaoPublicacao)
class ReacaoPublicacaoAdmin(admin.ModelAdmin):
    list_display = ('id_reacao', 'publicacao', 'usuario', 'data_reacao')
    search_fields = ('usuario__nome_usuario', 'publicacao__titulo')
    ordering = ('-data_reacao',)
    raw_id_fields = ('publicacao', 'usuario')


@admin.register(MidiaPublicacao)
class MidiaPublicacaoAdmin(admin.ModelAdmin):
    list_display = ('id_midia', 'publicacao', 'tipo_midia', 'data_upload')
    list_filter = ('tipo_midia',)
    raw_id_fields = ('publicacao',)


@admin.register(ElementoSonho)
class ElementoSonhoAdmin(admin.ModelAdmin):
    list_display = ('id_elemento', 'nome_elemento', 'categoria', 'contagem_usos')
    list_filter = ('categoria',)
    search_fields = ('nome_elemento', 'descricao')


@admin.register(ConfiguracaoUsuario)
class ConfiguracaoUsuarioAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'tema_interface', 'idioma', 'ultima_atualizacao')
    list_filter = ('tema_interface', 'idioma')
    raw_id_fields = ('usuario',)
