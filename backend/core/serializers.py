from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id_usuario', 'nome_usuario', 'email', 'nome_completo', 'bio', 'avatar_url', 'data_nascimento', 'data_criacao')

    def get_avatar_url(self, obj):
        if obj.avatar_url:
           request = self.context.get('request')
           if request:
               return request.build_absolute_uri(obj.avatar_url)
           return obj.avatar_url
        return None

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
