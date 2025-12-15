from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    seguidores_count = serializers.SerializerMethodField()
    seguindo_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id_usuario', 'nome_usuario', 'email', 'nome_completo', 'bio', 'avatar_url', 'data_nascimento', 'data_criacao', 'seguidores_count', 'seguindo_count', 'is_following')

    def get_avatar_url(self, obj):
        if obj.avatar_url:
           request = self.context.get('request')
           if request:
               return request.build_absolute_uri(obj.avatar_url)
           return obj.avatar_url
        return None

    def get_seguidores_count(self, obj):
        from .models import Seguidor
        return Seguidor.objects.filter(usuario_seguido=obj, status=1).count()

    def get_seguindo_count(self, obj):
        from .models import Seguidor
        return Seguidor.objects.filter(usuario_seguidor=obj, status=1).count()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if request.user.id_usuario == obj.id_usuario:
                return None  # Não mostra para o próprio usuário
            from .models import Seguidor
            return Seguidor.objects.filter(
                usuario_seguidor=request.user,
                usuario_seguido=obj,
                status=1
            ).exists()
        return False

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('nome_usuario', 'email', 'nome_completo', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            nome_usuario=validated_data['nome_usuario'],
            nome_completo=validated_data['nome_completo'],
            password=validated_data['password']
        )
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    class Meta:
        model = User
        fields = ('nome_completo', 'nome_usuario', 'bio', 'avatar_url', 'data_nascimento')
        extra_kwargs = {
            'nome_completo': {'required': False},
            'nome_usuario': {'required': False},
            'bio': {'required': False},
            'avatar_url': {'required': False},
            'data_nascimento': {'required': False},
        }

class LogoutSerializer(serializers.Serializer):
    """Serializer for logout - blacklists refresh token"""
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs

    def save(self, **kwargs):
        try:
            RefreshToken(self.token).blacklist()
        except TokenError:
            self.fail('bad_token')


# Dream (Publicacao) Serializers
from .models import Publicacao

class PublicacaoSerializer(serializers.ModelSerializer):
    """Serializer for reading dream posts"""
    usuario = UserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comentarios_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Publicacao
        fields = (
            'id_publicacao', 'usuario', 'titulo', 'conteudo_texto',
            'data_sonho', 'tipo_sonho', 'visibilidade', 'emocoes_sentidas', 'imagem',
            'data_publicacao', 'editado', 'data_edicao', 'views_count',
            'likes_count', 'comentarios_count', 'is_liked'
        )
        read_only_fields = ('id_publicacao', 'usuario', 'data_publicacao', 'editado', 'data_edicao', 'views_count')

    def get_likes_count(self, obj):
        from .models import ReacaoPublicacao
        return ReacaoPublicacao.objects.filter(publicacao=obj).count()

    def get_comentarios_count(self, obj):
        from .models import Comentario
        return Comentario.objects.filter(publicacao=obj, status=1).count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from .models import ReacaoPublicacao
            return ReacaoPublicacao.objects.filter(
                publicacao=obj,
                usuario=request.user
            ).exists()
        return False


class PublicacaoCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating dream posts"""
    class Meta:
        model = Publicacao
        fields = (
            'titulo', 'conteudo_texto', 'data_sonho', 'tipo_sonho',
            'visibilidade', 'emocoes_sentidas', 'localizacao', 'imagem'
        )
        extra_kwargs = {
            'titulo': {'required': False},
            'data_sonho': {'required': False},
            'tipo_sonho': {'required': False},
            'visibilidade': {'required': False},
            'emocoes_sentidas': {'required': False},
            'localizacao': {'required': False},
            'imagem': {'required': False},
        }


# Seguidor Serializer
from .models import Seguidor

class SeguidorSerializer(serializers.ModelSerializer):
    """Serializer for follow relationship"""
    usuario_seguidor = UserSerializer(read_only=True)
    usuario_seguido = UserSerializer(read_only=True)
    
    class Meta:
        model = Seguidor
        fields = ('id_seguidor', 'usuario_seguidor', 'usuario_seguido', 'data_seguimento', 'status')
        read_only_fields = ('id_seguidor', 'data_seguimento', 'status')
