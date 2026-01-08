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

class SearchView(APIView):
    """Unified search endpoint for posts, users, and hashtags"""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        search_type = request.query_params.get('type', 'all')
        limit = int(request.query_params.get('limit', 20))

        if not query:
            return Response({'results': {}, 'counts': {}}, status=status.HTTP_200_OK)

        results = {}
        counts = {}

        # Search Posts
        if search_type in ['all', 'posts']:
            posts = Publicacao.objects.filter(
                models.Q(conteudo_texto__icontains=query) | models.Q(titulo__icontains=query),
                visibilidade=1  # Only public posts
            ).annotate(
                engagement=Count('reacaopublicacao', distinct=True) + Count('comentario', distinct=True)
            ).order_by('-engagement')[:limit]
            results['posts'] = PublicacaoSerializer(posts, many=True, context={'request': request}).data
            counts['posts'] = len(results['posts'])

        # Search Users
        if search_type in ['all', 'users']:
            users = User.objects.filter(
                models.Q(nome_usuario__icontains=query) | models.Q(nome_completo__icontains=query)
            ).exclude(id_usuario=request.user.id_usuario)[:limit]
            results['users'] = UserSerializer(users, many=True, context={'request': request}).data
            counts['users'] = len(results['users'])

        # Search Hashtags
        if search_type in ['all', 'hashtags']:
            hashtags = Hashtag.objects.filter(
                texto_hashtag__istartswith=query.lstrip('#')
            ).order_by('-contagem_uso')[:limit]
            results['hashtags'] = HashtagSerializer(hashtags, many=True).data
            counts['hashtags'] = len(results['hashtags'])

        serializer = SearchSerializer(data={'results': results, 'counts': counts})
        serializer.is_valid()
        return Response(serializer.data)

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
from .models import Publicacao, Seguidor, ReacaoPublicacao, Comentario, Hashtag, PublicacaoHashtag
from .serializers import PublicacaoSerializer, PublicacaoCreateSerializer, SeguidorSerializer, HashtagSerializer, SearchSerializer
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
        
        # Helper to get following IDs
        following_ids = Seguidor.objects.filter(
            usuario_seguidor=user, status=1
        ).values_list('usuario_seguido_id', flat=True)

        if self.action == 'list':
            tab = self.request.query_params.get('tab', 'following')
            
            if tab == 'foryou':
                # For You: Public dreams ordered by engagement (likes + comments)
                return Publicacao.objects.filter(
                    visibilidade=1
                ).annotate(
                    engagement=Count('reacaopublicacao', distinct=True) + Count('comentario', distinct=True)
                ).order_by('-engagement', '-data_publicacao')[:50]
            
            # Following: Dreams from people user follows + own dreams
            return Publicacao.objects.filter(
                Q(usuario__in=following_ids) | Q(usuario=user)
            ).order_by('-data_publicacao')

        # For detailed actions (retrieve, like, etc), return all accessible posts
        # Accessible = Public OR Own OR Followed
        return Publicacao.objects.filter(
            Q(visibilidade=1) | 
            Q(usuario=user) | 
            Q(usuario__in=following_ids)
        ).distinct()
    
    def perform_create(self, serializer):
        post = serializer.save(usuario=self.request.user)
        
        # Extract hashtags
        import re
        hashtags = re.findall(r'#(\w+)', post.conteudo_texto)
        
        for tag_text in set(hashtags):
            hashtag, created = Hashtag.objects.get_or_create(texto_hashtag=tag_text)
            if not created:
                hashtag.contagem_uso += 1
                hashtag.ultima_utilizacao = timezone.now()
                hashtag.save()
            
            PublicacaoHashtag.objects.create(
                publicacao=post,
                hashtag=hashtag
            )
    
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

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Toggle like on a dream post"""
        dream = self.get_object()
        existing_like = ReacaoPublicacao.objects.filter(
            publicacao=dream,
            usuario=request.user
        ).first()

        if existing_like:
            existing_like.delete()
            is_liked = False
        else:
            ReacaoPublicacao.objects.create(
                publicacao=dream,
                usuario=request.user
            )
            is_liked = True
            # Create notification for like (tipo 3 = Curtida)
            from .views import create_notification
            create_notification(
                usuario_destino=dream.usuario,
                usuario_origem=request.user,
                tipo=3,
                id_referencia=dream.id_publicacao,
                conteudo=dream.titulo or dream.conteudo_texto[:50]
            )

        likes_count = ReacaoPublicacao.objects.filter(publicacao=dream).count()

        return Response({
            'is_liked': is_liked,
            'likes_count': likes_count
        }, status=status.HTTP_200_OK)


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
        
        # Create notification for new follower (tipo 4 = Seguidor Novo)
        from .views import create_notification
        create_notification(
            usuario_destino=user_to_follow,
            usuario_origem=request.user,
            tipo=4
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


# Comments ViewSet
from .serializers import ComentarioSerializer, ComentarioCreateSerializer

class ComentarioViewSet(viewsets.ModelViewSet):
    """ViewSet for comments on dream posts"""
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ComentarioCreateSerializer
        return ComentarioSerializer
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def get_queryset(self):
        """Return comments for a specific dream"""
        dream_id = self.kwargs.get('dream_pk')
        if dream_id:
            return Comentario.objects.filter(
                publicacao_id=dream_id,
                status=1
            ).order_by('-data_comentario')
        return Comentario.objects.none()
    
    def perform_create(self, serializer):
        dream_id = self.kwargs.get('dream_pk')
        dream = get_object_or_404(Publicacao, pk=dream_id)
        comment = serializer.save(usuario=self.request.user, publicacao=dream)
        
        # Create notification for comment (tipo 2 = Comentário)
        create_notification(
            usuario_destino=dream.usuario,
            usuario_origem=self.request.user,
            tipo=2,
            id_referencia=dream.id_publicacao,
            conteudo=comment.conteudo_texto[:100]
        )
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.usuario.id_usuario != request.user.id_usuario:
            return Response(
                {'error': 'Você só pode editar seus próprios comentários'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.usuario.id_usuario != request.user.id_usuario:
            return Response(
                {'error': 'Você só pode excluir seus próprios comentários'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


# Notifications ViewSet
from .models import Notificacao
from .serializers import NotificacaoSerializer

class NotificacaoViewSet(viewsets.ModelViewSet):
    """ViewSet for user notifications"""
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = NotificacaoSerializer
    http_method_names = ['get', 'patch']
    
    def get_queryset(self):
        """Return notifications for the current user"""
        return Notificacao.objects.filter(
            usuario_destino=self.request.user
        ).order_by('-data_criacao')[:50]
    
    @action(detail=True, methods=['patch'])
    def read(self, request, pk=None):
        """Mark a notification as read"""
        notification = self.get_object()
        notification.lida = True
        notification.data_leitura = timezone.now()
        notification.save()
        return Response({'lida': True}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['patch'])
    def read_all(self, request):
        """Mark all notifications as read"""
        updated = Notificacao.objects.filter(
            usuario_destino=request.user,
            lida=False
        ).update(lida=True, data_leitura=timezone.now())
        return Response({'marked_read': updated}, status=status.HTTP_200_OK)


# Helper function to create notifications
def create_notification(usuario_destino, usuario_origem, tipo, id_referencia=None, conteudo=None):
    """Create a notification if destino != origem"""
    if usuario_destino.id_usuario != usuario_origem.id_usuario:
        Notificacao.objects.create(
            usuario_destino=usuario_destino,
            usuario_origem=usuario_origem,
            tipo_notificacao=tipo,
            id_referencia=id_referencia,
            conteudo=conteudo
        )


