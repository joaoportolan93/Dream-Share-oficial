from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id_usuario', 'nome_usuario', 'email', 'nome_completo', 'bio', 'avatar_url')

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
