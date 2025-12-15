from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
import os
import uuid
from .serializers import RegisterSerializer, UserSerializer, UserUpdateSerializer, LogoutSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

class UserProfileView(APIView):
    """Get current authenticated user's profile"""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

class UserDetailView(APIView):
    """Get or update a specific user's profile"""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        
        # Only allow users to update their own profile
        if request.user.id_usuario != pk:
            return Response(
                {'error': 'Você só pode editar seu próprio perfil'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    """Logout by blacklisting the refresh token"""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Logout realizado com sucesso'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AvatarUploadView(APIView):
    """Upload avatar image for authenticated user"""
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser,)

    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

    def post(self, request):
        if 'avatar' not in request.FILES:
            return Response(
                {'error': 'Nenhum arquivo enviado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['avatar']
        
        # Validate file extension
        ext = file.name.split('.')[-1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            return Response(
                {'error': f'Formato não permitido. Use: {", ".join(self.ALLOWED_EXTENSIONS)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size
        if file.size > self.MAX_FILE_SIZE:
            return Response(
                {'error': 'Arquivo muito grande. Máximo: 5MB'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create unique filename
        filename = f"avatar_{request.user.id_usuario}_{uuid.uuid4().hex[:8]}.{ext}"
        
        # Ensure avatars directory exists
        avatars_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
        os.makedirs(avatars_dir, exist_ok=True)
        
        # Save file
        filepath = os.path.join(avatars_dir, filename)
        with open(filepath, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        # Update user's avatar_url
        avatar_url = f"{settings.MEDIA_URL}avatars/{filename}"
        request.user.avatar_url = avatar_url
        request.user.save()
        
        # Build absolute URL for response
        absolute_avatar_url = request.build_absolute_uri(avatar_url)
        
        return Response({
            'message': 'Avatar atualizado com sucesso',
            'avatar_url': absolute_avatar_url
        }, status=status.HTTP_200_OK)


class SuggestedUsersView(APIView):
    """Get suggested users to follow"""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        from .models import Seguidor
        
        # Get IDs of users the current user already follows
        following_ids = Seguidor.objects.filter(
            usuario_seguidor=request.user, status=1
        ).values_list('usuario_seguido_id', flat=True)
        
        # Get users that the current user doesn't follow yet (excluding self)
        suggested = User.objects.exclude(
            id_usuario__in=list(following_ids) + [request.user.id_usuario]
        ).order_by('?')[:5]  # Random 5 users
        
        serializer = UserSerializer(suggested, many=True, context={'request': request})
        return Response(serializer.data)


# Dream (Publicacao) Views
from rest_framework import viewsets
from rest_framework.decorators import action
from .models import Publicacao, Seguidor, ReacaoPublicacao, Comentario
from .serializers import PublicacaoSerializer, PublicacaoCreateSerializer, SeguidorSerializer
from django.utils import timezone
from django.db.models import Count, Q

class PublicacaoViewSet(viewsets.ModelViewSet):
    """ViewSet for dream posts CRUD operations"""
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PublicacaoCreateSerializer
        return PublicacaoSerializer
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def get_queryset(self):
        """Return dreams based on tab parameter: following or foryou"""
        user = self.request.user
        tab = self.request.query_params.get('tab', 'following')
        
        if tab == 'foryou':
            # For You: Public dreams ordered by engagement (likes + comments)
            return Publicacao.objects.filter(
                visibilidade=1
            ).annotate(
                engagement=Count('reacaopublicacao', distinct=True) + Count('comentario', distinct=True)
            ).order_by('-engagement', '-data_publicacao')[:50]
        
        # Following: Dreams from people user follows + own dreams
        following_ids = Seguidor.objects.filter(
            usuario_seguidor=user, status=1
        ).values_list('usuario_seguido_id', flat=True)
        
        return Publicacao.objects.filter(
            Q(usuario__in=following_ids) | Q(usuario=user)
        ).order_by('-data_publicacao')
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(editado=True, data_edicao=timezone.now())
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.usuario.id_usuario != request.user.id_usuario:
            return Response(
                {'error': 'Você só pode editar seus próprios sonhos'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.usuario.id_usuario != request.user.id_usuario:
            return Response(
                {'error': 'Você só pode excluir seus próprios sonhos'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class FollowView(APIView):
    """Views for following/unfollowing users"""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        """Follow a user"""
        user_to_follow = get_object_or_404(User, pk=pk)
        
        # Can't follow yourself
        if request.user.id_usuario == pk:
            return Response(
                {'error': 'Você não pode seguir a si mesmo'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already following
        existing = Seguidor.objects.filter(
            usuario_seguidor=request.user,
            usuario_seguido=user_to_follow
        ).first()
        
        if existing:
            if existing.status == 1:
                return Response(
                    {'error': 'Você já está seguindo este usuário'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Reactivate if was blocked/inactive
            existing.status = 1
            existing.save()
        else:
            Seguidor.objects.create(
                usuario_seguidor=request.user,
                usuario_seguido=user_to_follow,
                status=1
            )
        
        return Response({
            'message': f'Você agora está seguindo {user_to_follow.nome_usuario}',
            'is_following': True
        }, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        """Unfollow a user"""
        user_to_unfollow = get_object_or_404(User, pk=pk)
        
        follow = Seguidor.objects.filter(
            usuario_seguidor=request.user,
            usuario_seguido=user_to_unfollow,
            status=1
        ).first()
        
        if not follow:
            return Response(
                {'error': 'Você não está seguindo este usuário'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        follow.delete()
        
        return Response({
            'message': f'Você deixou de seguir {user_to_unfollow.nome_usuario}',
            'is_following': False
        }, status=status.HTTP_200_OK)
