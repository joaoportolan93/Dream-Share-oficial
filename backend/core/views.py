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
from .throttles import LoginRateThrottle, RegisterRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView

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
    throttle_classes = [RegisterRateThrottle]


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view with rate limiting and ban check"""
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        # First check if user is banned before attempting login
        email = request.data.get('email')
        if email:
            try:
                user = User.objects.get(email=email)
                if user.status == 2:  # Suspenso/Banido
                    return Response({
                        'error': 'Conta banida',
                        'message': 'Sua conta foi banida por tempo indeterminado devido a violação das regras da comunidade.',
                        'banned': True
                    }, status=status.HTTP_403_FORBIDDEN)
            except User.DoesNotExist:
                pass  # Let the parent handle invalid credentials
        
        return super().post(request, *args, **kwargs)

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
        data = serializer.data
        
        # Add follow_status for the requesting user
        if request.user.id_usuario != pk:
            from .models import Seguidor
            follow = Seguidor.objects.filter(
                usuario_seguidor=request.user,
                usuario_seguido=user
            ).first()
            if follow:
                if follow.status == 1:
                    data['follow_status'] = 'following'
                elif follow.status == 3:
                    data['follow_status'] = 'pending'
                else:
                    data['follow_status'] = 'none'
            else:
                data['follow_status'] = 'none'
        else:
            data['follow_status'] = None  # Own profile
        
        # Add ban info if user is banned
        if user.status == 2:
            # Try to find the most recent resolved report against this user
            from .models import Denuncia
            last_report = Denuncia.objects.filter(
                tipo_conteudo=3,  # User report
                id_conteudo=user.id_usuario,
                status_denuncia=3  # Resolved
            ).order_by('-data_resolucao').first()
            
            ban_reasons = {
                1: 'Conteúdo Inadequado',
                2: 'Assédio / Discurso de Ódio',
                3: 'Spam / Enganoso'
            }
            
            data['is_banned'] = True
            data['ban_reason'] = ban_reasons.get(last_report.motivo_denuncia, 'Violação das regras') if last_report else 'Violação das regras da comunidade'
        else:
            data['is_banned'] = False
        
        return Response(data)

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

    def patch(self, request, pk):
        return self.put(request, pk)

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
from .models import Publicacao, Seguidor, ReacaoPublicacao, Comentario, Hashtag, PublicacaoHashtag, PublicacaoSalva
from .serializers import PublicacaoSerializer, PublicacaoCreateSerializer, SeguidorSerializer, HashtagSerializer, SearchSerializer, NotificacaoSerializer
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

        # Base filter: exclude posts from banned users (status=2)
        base_filter = Q(usuario__status=1)  # Only active users

        if self.action == 'list':
            tab = self.request.query_params.get('tab', 'following')
            
            if tab == 'mine':
                # My Dreams: All dreams by the current user
                return Publicacao.objects.filter(
                    usuario=user
                ).order_by('-data_publicacao')

            if tab == 'saved':
                # Saved Dreams: Posts saved by the user
                return Publicacao.objects.filter(
                    base_filter,
                    publicacaosalva__usuario=user
                ).order_by('-publicacaosalva__data_salvo')
            
            if tab == 'community':
                community_id = self.request.query_params.get('community_id')
                if community_id:
                    return Publicacao.objects.filter(
                        base_filter,
                        comunidade_id=community_id
                    ).order_by('-data_publicacao')

            if tab == 'foryou':
                # For You: Public dreams ordered by engagement (likes + comments)
                return Publicacao.objects.filter(
                    base_filter,
                    visibilidade=1
                ).annotate(
                    engagement=Count('reacaopublicacao', distinct=True) + Count('comentario', distinct=True)
                ).order_by('-engagement', '-data_publicacao')[:50]
            
            # Following: Dreams from people user follows + own dreams
            return Publicacao.objects.filter(
                base_filter,
                Q(usuario__in=following_ids) | Q(usuario=user)
            ).order_by('-data_publicacao')

        # For detailed actions (retrieve, like, etc), return all accessible posts
        # Accessible = Public OR Own OR Followed (but not from banned users)
        return Publicacao.objects.filter(
            base_filter,
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

    @action(detail=True, methods=['post'], url_path='save')
    def save_post(self, request, pk=None):
        """Toggle save on a dream post"""
        dream = self.get_object()
        existing_save = PublicacaoSalva.objects.filter(
            publicacao=dream,
            usuario=request.user
        ).first()

        if existing_save:
            existing_save.delete()
            is_saved = False
            message = 'Post removido dos salvos'
        else:
            PublicacaoSalva.objects.create(
                publicacao=dream,
                usuario=request.user
            )
            is_saved = True
            message = 'Post salvo com sucesso'

        return Response({
            'is_saved': is_saved,
            'message': message
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
        
        # Check if already following or pending
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
            if existing.status == 3:
                return Response(
                    {'error': 'Solicitação já enviada', 'follow_status': 'pending'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Reactivate if was blocked/inactive - check privacy
            if user_to_follow.privacidade_padrao == 2:
                existing.status = 3  # Pending for private accounts
                existing.data_seguimento = timezone.now()
                existing.save()
                return Response({
                    'message': f'Solicitação enviada para {user_to_follow.nome_usuario}',
                    'follow_status': 'pending'
                }, status=status.HTTP_200_OK)
            else:
                existing.status = 1
                existing.save()
        else:
            # Determine status based on target's privacy setting
            if user_to_follow.privacidade_padrao == 2:
                # Private account: create pending follow request
                Seguidor.objects.create(
                    usuario_seguidor=request.user,
                    usuario_seguido=user_to_follow,
                    status=3  # Pendente
                )
                # Create notification for follow request (tipo 5 = Solicitação de Seguidor)
                from .views import create_notification
                create_notification(
                    usuario_destino=user_to_follow,
                    usuario_origem=request.user,
                    tipo=5  # New type for follow request
                )
                return Response({
                    'message': f'Solicitação enviada para {user_to_follow.nome_usuario}',
                    'follow_status': 'pending'
                }, status=status.HTTP_200_OK)
            else:
                # Public account: follow immediately
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
            'follow_status': 'following'
        }, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        """Unfollow a user or cancel pending request"""
        user_to_unfollow = get_object_or_404(User, pk=pk)
        
        follow = Seguidor.objects.filter(
            usuario_seguidor=request.user,
            usuario_seguido=user_to_unfollow,
            status__in=[1, 3]  # Active or Pending
        ).first()
        
        if not follow:
            return Response(
                {'error': 'Você não está seguindo este usuário'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        was_pending = follow.status == 3
        follow.delete()
        
        return Response({
            'message': f'Você deixou de seguir {user_to_unfollow.nome_usuario}' if not was_pending else 'Solicitação cancelada',
            'follow_status': 'none'
        }, status=status.HTTP_200_OK)


class FollowRequestsView(APIView):
    """Get pending follow requests for the current user"""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        pending_requests = Seguidor.objects.filter(
            usuario_seguido=request.user,
            status=3  # Pendente
        ).order_by('-data_seguimento')
        
        data = []
        for req in pending_requests:
            user = req.usuario_seguidor
            data.append({
                'id_usuario': user.id_usuario,
                'nome_usuario': user.nome_usuario,
                'nome_completo': user.nome_completo,
                'avatar_url': request.build_absolute_uri(user.avatar_url) if user.avatar_url else None,
                'data_solicitacao': req.data_seguimento.isoformat(),
            })
        
        return Response(data)


class FollowRequestActionView(APIView):
    """Accept or reject a pending follow request"""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        action = request.data.get('action')  # 'accept' or 'reject'
        
        # Find the pending follow request
        follow_request = Seguidor.objects.filter(
            usuario_seguidor_id=pk,
            usuario_seguido=request.user,
            status=3  # Pendente
        ).first()
        
        if not follow_request:
            return Response(
                {'error': 'Solicitação não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if action == 'accept':
            follow_request.status = 1  # Ativo
            follow_request.save()
            
            # Create notification for follower that request was accepted
            create_notification(
                usuario_destino=follow_request.usuario_seguidor,
                usuario_origem=request.user,
                tipo=4,  # Seguidor Novo (they are now following)
                conteudo='aceitou sua solicitação de seguir'
            )
            
            return Response({
                'message': 'Solicitação aceita',
                'status': 'accepted'
            }, status=status.HTTP_200_OK)
        
        elif action == 'reject':
            follow_request.delete()
            return Response({
                'message': 'Solicitação recusada',
                'status': 'rejected'
            }, status=status.HTTP_200_OK)
        
        return Response(
            {'error': 'Ação inválida. Use "accept" ou "reject"'},
            status=status.HTTP_400_BAD_REQUEST
        )

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
    """Create a notification if destino != origem AND user has that notification type enabled"""
    if usuario_destino.id_usuario != usuario_origem.id_usuario:
        # Check user's notification settings
        try:
            settings = ConfiguracaoUsuario.objects.get(usuario=usuario_destino)
            
            # Map notification types to settings fields
            # tipo: 1=Nova Publicação, 2=Comentário, 3=Curtida, 4=Seguidor Novo
            notification_settings = {
                1: settings.notificacoes_novas_publicacoes,
                2: settings.notificacoes_comentarios,
                3: settings.notificacoes_reacoes,
                4: settings.notificacoes_seguidor_novo,
            }
            
            # Check if this notification type is enabled
            if not notification_settings.get(tipo, True):
                return  # User has disabled this notification type
                
        except ConfiguracaoUsuario.DoesNotExist:
            # No settings exist, allow all notifications by default
            pass
        
        Notificacao.objects.create(
            usuario_destino=usuario_destino,
            usuario_origem=usuario_origem,
            tipo_notificacao=tipo,
            id_referencia=id_referencia,
            conteudo=conteudo
        )


# ==========================================
# ADMIN VIEWS - Issue #29
# ==========================================

from .models import Denuncia
from datetime import timedelta

class IsAdminPermission(permissions.BasePermission):
    """Custom permission to only allow admins"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class AdminStatsView(APIView):
    """Admin dashboard statistics - Issue #29"""
    permission_classes = [IsAdminPermission]

    def get(self, request):
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)

        # Basic stats
        total_users = User.objects.count()
        banned_users = User.objects.filter(status=2).count()
        total_dreams = Publicacao.objects.count()
        pending_reports = Denuncia.objects.filter(status_denuncia=1).count()

        # Last 7 days data for charts
        daily_stats = []
        for i in range(7):
            day = today - timedelta(days=6-i)
            next_day = day + timedelta(days=1)
            signups = User.objects.filter(
                data_criacao__date=day
            ).count()
            reports = Denuncia.objects.filter(
                data_denuncia__date=day
            ).count()
            daily_stats.append({
                'date': day.isoformat(),
                'signups': signups,
                'reports': reports
            })

        return Response({
            'kpis': {
                'total_users': total_users,
                'banned_users': banned_users,
                'total_dreams': total_dreams,
                'pending_reports': pending_reports,
            },
            'daily_stats': daily_stats
        })


class AdminUsersView(APIView):
    """Admin user management - Issue #29"""
    permission_classes = [IsAdminPermission]

    def get(self, request):
        search = request.query_params.get('search', '')
        users = User.objects.all()
        
        if search:
            users = users.filter(
                models.Q(nome_usuario__icontains=search) |
                models.Q(email__icontains=search) |
                models.Q(id_usuario__icontains=search) if search.isdigit() else models.Q(nome_usuario__icontains=search)
            )
        
        users = users.order_by('-data_criacao')[:100]
        
        data = [{
            'id_usuario': u.id_usuario,
            'nome_usuario': u.nome_usuario,
            'email': u.email,
            'nome_completo': u.nome_completo,
            'avatar_url': u.avatar_url,
            'status': u.status,
            'status_display': dict(User.STATUS_CHOICES).get(u.status, 'Unknown'),
            'data_criacao': u.data_criacao.isoformat(),
            'is_admin': u.is_admin,
        } for u in users]
        
        return Response(data)


class AdminUserDetailView(APIView):
    """Admin user detail/actions - Issue #29"""
    permission_classes = [IsAdminPermission]

    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        return Response({
            'id_usuario': user.id_usuario,
            'nome_usuario': user.nome_usuario,
            'email': user.email,
            'nome_completo': user.nome_completo,
            'bio': user.bio,
            'avatar_url': user.avatar_url,
            'data_nascimento': user.data_nascimento,
            'data_criacao': user.data_criacao.isoformat(),
            'status': user.status,
            'is_admin': user.is_admin,
            'verificado': user.verificado,
            'posts_count': Publicacao.objects.filter(usuario=user).count(),
            'followers_count': Seguidor.objects.filter(usuario_seguido=user, status=1).count(),
            'following_count': Seguidor.objects.filter(usuario_seguidor=user, status=1).count(),
        })

    def patch(self, request, pk):
        """Update user status (ban/unban)"""
        user = get_object_or_404(User, pk=pk)
        new_status = request.data.get('status')
        
        if new_status in [1, 2, 3]:
            user.status = new_status
            user.save()
            return Response({'message': 'Status atualizado', 'status': new_status})
        
        return Response({'error': 'Status inválido'}, status=status.HTTP_400_BAD_REQUEST)


class AdminReportsView(APIView):
    """Admin moderation queue - Issue #29"""
    permission_classes = [IsAdminPermission]

    def get(self, request):
        status_filter = request.query_params.get('status', '1')  # Default pending
        reports = Denuncia.objects.filter(status_denuncia=int(status_filter)).order_by('-data_denuncia')[:50]
        
        data = []
        for r in reports:
            item = {
                'id_denuncia': r.id_denuncia,
                'tipo_conteudo': r.tipo_conteudo,
                'tipo_conteudo_display': dict(Denuncia.TIPO_CONTEUDO_CHOICES).get(r.tipo_conteudo),
                'id_conteudo': r.id_conteudo,
                'motivo_denuncia': r.motivo_denuncia,
                'motivo_display': dict(Denuncia.MOTIVO_DENUNCIA_CHOICES).get(r.motivo_denuncia),
                'descricao_denuncia': r.descricao_denuncia,
                'data_denuncia': r.data_denuncia.isoformat(),
                'status_denuncia': r.status_denuncia,
                'reporter': {
                    'id': r.usuario_denunciante.id_usuario,
                    'username': r.usuario_denunciante.nome_usuario,
                }
            }
            
            # Get reported content
            if r.tipo_conteudo == 1:  # Post
                post = Publicacao.objects.filter(id_publicacao=r.id_conteudo).first()
                if post:
                    item['content'] = {
                        'type': 'post',
                        'id': post.id_publicacao,
                        'titulo': post.titulo,
                        'conteudo_texto': post.conteudo_texto,
                        'usuario': {
                            'id': post.usuario.id_usuario,
                            'username': post.usuario.nome_usuario,
                        }
                    }
            elif r.tipo_conteudo == 2:  # Comment
                comment = Comentario.objects.filter(id_comentario=r.id_conteudo).first()
                if comment:
                    item['content'] = {
                        'type': 'comment',
                        'id': comment.id_comentario,
                        'texto': comment.conteudo_texto,
                        'usuario': {
                            'id': comment.usuario.id_usuario,
                            'username': comment.usuario.nome_usuario,
                        }
                    }
            elif r.tipo_conteudo == 3:  # User
                reported_user = User.objects.filter(id_usuario=r.id_conteudo).first()
                if reported_user:
                    item['content'] = {
                        'type': 'user',
                        'id': reported_user.id_usuario,
                        'username': reported_user.nome_usuario,
                    }
            
            data.append(item)
        
        return Response(data)


class AdminReportActionView(APIView):
    """Handle report actions - Issue #29"""
    permission_classes = [IsAdminPermission]

    def post(self, request, pk):
        report = get_object_or_404(Denuncia, pk=pk)
        action = request.data.get('action')  # ignore, remove, ban

        if action == 'ignore':
            report.status_denuncia = 3  # Resolvida
            report.acao_tomada = 1  # Nenhuma
            report.data_resolucao = timezone.now()
            report.save()
            return Response({'message': 'Denúncia ignorada'})

        elif action == 'remove':
            # Remove content based on type
            if report.tipo_conteudo == 1:  # Post
                Publicacao.objects.filter(id_publicacao=report.id_conteudo).delete()
            elif report.tipo_conteudo == 2:  # Comment
                Comentario.objects.filter(id_comentario=report.id_conteudo).update(status=2)
            
            report.status_denuncia = 3
            report.acao_tomada = 2  # Removido
            report.data_resolucao = timezone.now()
            report.save()
            return Response({'message': 'Conteúdo removido'})

        elif action == 'ban':
            # Get user to ban based on content type
            user_to_ban = None
            if report.tipo_conteudo == 1:
                post = Publicacao.objects.filter(id_publicacao=report.id_conteudo).first()
                if post:
                    user_to_ban = post.usuario
            elif report.tipo_conteudo == 2:
                comment = Comentario.objects.filter(id_comentario=report.id_conteudo).first()
                if comment:
                    user_to_ban = comment.usuario
            elif report.tipo_conteudo == 3:
                user_to_ban = User.objects.filter(id_usuario=report.id_conteudo).first()
            
            if user_to_ban:
                user_to_ban.status = 2  # Suspenso
                user_to_ban.save()
            
            report.status_denuncia = 3
            report.acao_tomada = 3  # Usuário Suspenso
            report.data_resolucao = timezone.now()
            report.save()
            return Response({'message': 'Usuário banido'})

        return Response({'error': 'Ação inválida'}, status=status.HTTP_400_BAD_REQUEST)


class CreateReportView(APIView):
    """Create a new report (denuncia) from users"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        id_conteudo = request.data.get('id_conteudo')
        tipo_conteudo = request.data.get('tipo_conteudo')
        motivo_denuncia = request.data.get('motivo_denuncia')
        descricao_denuncia = request.data.get('descricao_denuncia')

        if not all([id_conteudo, tipo_conteudo, motivo_denuncia]):
            return Response(
                {'error': 'Campos obrigatórios: id_conteudo, tipo_conteudo, motivo_denuncia'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate tipo_conteudo
        if tipo_conteudo not in [1, 2, 3]:
            return Response(
                {'error': 'tipo_conteudo inválido. Use: 1 (Post), 2 (Comment), 3 (User)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate motivo_denuncia
        if motivo_denuncia not in [1, 2, 3]:
            return Response(
                {'error': 'motivo_denuncia inválido. Use: 1, 2 ou 3'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if content exists
        if tipo_conteudo == 1:
            if not Publicacao.objects.filter(id_publicacao=id_conteudo).exists():
                return Response({'error': 'Publicação não encontrada'}, status=status.HTTP_404_NOT_FOUND)
        elif tipo_conteudo == 2:
            if not Comentario.objects.filter(id_comentario=id_conteudo).exists():
                return Response({'error': 'Comentário não encontrado'}, status=status.HTTP_404_NOT_FOUND)
        elif tipo_conteudo == 3:
            if not User.objects.filter(id_usuario=id_conteudo).exists():
                return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)

        # Create report
        report = Denuncia.objects.create(
            usuario_denunciante=request.user,
            tipo_conteudo=tipo_conteudo,
            id_conteudo=id_conteudo,
            motivo_denuncia=motivo_denuncia,
            descricao_denuncia=descricao_denuncia,
            status_denuncia=1  # Pendente
        )

        return Response({
            'message': 'Denúncia enviada com sucesso',
            'id_denuncia': report.id_denuncia
        }, status=status.HTTP_201_CREATED)


# ==========================================
# USER SETTINGS & CLOSE FRIENDS VIEWS
# ==========================================

from .models import ConfiguracaoUsuario
from .serializers import UserSettingsSerializer, CloseFriendSerializer

class UserSettingsView(APIView):
    """Get or update user settings (ConfiguracaoUsuario)"""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        # Auto-create settings if not exists (for existing users)
        settings_obj, created = ConfiguracaoUsuario.objects.get_or_create(
            usuario=request.user
        )
        serializer = UserSettingsSerializer(settings_obj)
        return Response(serializer.data)

    def patch(self, request):
        settings_obj, created = ConfiguracaoUsuario.objects.get_or_create(
            usuario=request.user
        )
        serializer = UserSettingsSerializer(settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(ultima_atualizacao=timezone.now())
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CloseFriendsManagerView(APIView):
    """List followers with close friend status for management"""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        # Get all people who follow the current user (they can be close friends)
        followers = Seguidor.objects.filter(
            usuario_seguido=request.user,
            status=1
        ).select_related('usuario_seguidor').order_by('-is_close_friend', '-data_seguimento')
        
        serializer = CloseFriendSerializer(followers, many=True, context={'request': request})
        return Response(serializer.data)


class ToggleCloseFriendView(APIView):
    """Toggle close friend status for a follower"""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        # Find the follow relationship where pk is the follower's user id
        follow = get_object_or_404(
            Seguidor,
            usuario_seguidor_id=pk,
            usuario_seguido=request.user,
            status=1
        )
        
        # Toggle the close friend status
        follow.is_close_friend = not follow.is_close_friend
        follow.save()
        
        return Response({
            'id_usuario': pk,
            'is_close_friend': follow.is_close_friend,
            'message': 'Amigo próximo adicionado' if follow.is_close_friend else 'Amigo próximo removido'
        }, status=status.HTTP_200_OK)



# ==========================================
# COMMUNITIES VIEWS
# ==========================================

from .models import Comunidade
from .serializers import ComunidadeSerializer

class ComunidadeViewSet(viewsets.ModelViewSet):
    """ViewSet for communities CRUD operations"""
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ComunidadeSerializer
    queryset = Comunidade.objects.all().order_by('-data_criacao')
    
    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        # Create community and add creator as member
        comunidade = serializer.save()
        comunidade.membros.add(self.request.user)
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join or leave a community"""
        comunidade = self.get_object()
        user = request.user
        
        if comunidade.membros.filter(id_usuario=user.id_usuario).exists():
            comunidade.membros.remove(user)
            is_member = False
            message = 'Você saiu da comunidade'
        else:
            comunidade.membros.add(user)
            is_member = True
            message = 'Você entrou na comunidade'
            
        return Response({
            'is_member': is_member,
            'message': message,
            'membros_count': comunidade.membros.count()
        }, status=status.HTTP_200_OK)

# Comunidade Views
from .models import Comunidade, MembroComunidade
from .serializers import ComunidadeSerializer, CommunityStatsSerializer

class ComunidadeViewSet(viewsets.ModelViewSet):
    """ViewSet for communities"""
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ComunidadeSerializer
    queryset = Comunidade.objects.all()

    def get_serializer_context(self):
        return {'request': self.request}

    def get_queryset(self):
        """Filter communities - can filter to only show member communities"""
        queryset = Comunidade.objects.all().order_by('-data_criacao')
        if self.request.query_params.get('member') == 'true':
            queryset = queryset.filter(membros=self.request.user)
        return queryset

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join a community"""
        community = self.get_object()
        user = request.user
        
        # Check if already member
        if MembroComunidade.objects.filter(comunidade=community, usuario=user).exists():
            return Response({'error': 'Você já é membro desta comunidade'}, status=status.HTTP_400_BAD_REQUEST)
            
        MembroComunidade.objects.create(comunidade=community, usuario=user)
        return Response({
            'message': 'Bem-vindo à comunidade!',
            'is_member': True,
            'membros_count': community.membros.count()
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave a community"""
        community = self.get_object()
        user = request.user
        
        membership = MembroComunidade.objects.filter(comunidade=community, usuario=user).first()
        if not membership:
             return Response({'error': 'Você não é membro desta comunidade'}, status=status.HTTP_400_BAD_REQUEST)
        
        membership.delete()
        return Response({
            'message': 'Você saiu da comunidade',
            'is_member': False,
            'membros_count': community.membros.count()
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def moderator_stats(self, request, pk=None):
        """Get community statistics (Moderators only)"""
        community = self.get_object()
        user = request.user

        # Check permission (Owner or Moderator)
        # For now, simplistic: if user is admin OR is a moderator of the community
        # Since 'owner' isn't on Comunidade model directly yet (maybe created by?), we check MembroComunidade role
        is_mod = MembroComunidade.objects.filter(
            comunidade=community, 
            usuario=user,
            role__in=['moderator', 'admin']
        ).exists()

        if not is_mod and not user.is_admin:
             return Response(
                {'error': 'Apenas moderadores podem ver estatísticas'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Calculate Stats
        today = timezone.now()
        seven_days_ago = today - timedelta(days=7)
        thirty_days_ago = today - timedelta(days=30)
        
        total_members = community.membros.count()
        new_members_7 = MembroComunidade.objects.filter(comunidade=community, data_entrada__gte=seven_days_ago).count()
        new_members_30 = MembroComunidade.objects.filter(comunidade=community, data_entrada__gte=thirty_days_ago).count()
        
        total_posts = community.publicacoes.count()
        posts_7 = community.publicacoes.filter(data_publicacao__gte=seven_days_ago).count()
        
        # Active members: users who posted in last 7 days
        active_members_7 = community.publicacoes.filter(
            data_publicacao__gte=seven_days_ago
        ).values('usuario').distinct().count()
        
        # Pending reports (Mock implementation until Reports are linked to Communities)
        # Assuming Denuncia model can be linked to Community content
        pending_reports = 0 

        data = {
            'total_members': total_members,
            'new_members_last_7_days': new_members_7,
            'new_members_last_30_days': new_members_30,
            'total_posts': total_posts,
            'posts_last_7_days': posts_7,
            'active_members_last_7_days': active_members_7,
            'pending_reports': pending_reports
        }
        
        serializer = CommunityStatsSerializer(data=data)
        serializer.is_valid()
        return Response(serializer.data)


# Rascunho (Draft) ViewSet
from .models import Rascunho
from .serializers import RascunhoSerializer

class RascunhoViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user's post drafts"""
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = RascunhoSerializer

    def get_queryset(self):
        """Return only the current user's drafts"""
        return Rascunho.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        """Automatically set the current user as the draft owner"""
        serializer.save(usuario=self.request.user)

