import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaBirthdayCake, FaArrowLeft, FaLock } from 'react-icons/fa';
import { getUser, getProfile, followUser, unfollowUser, getDreams } from '../services/api';
import DreamCard from '../components/DreamCard';

const UserProfile = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [followStatus, setFollowStatus] = useState('none'); // 'following', 'pending', 'none'
    const [followLoading, setFollowLoading] = useState(false);
    const [userDreams, setUserDreams] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, profileRes] = await Promise.all([
                    getUser(id),
                    getProfile()
                ]);
                setUser(userRes.data);
                setCurrentUser(profileRes.data);
                setFollowStatus(userRes.data.follow_status || 'none');

                // Fetch user's dreams only if can see them (not private or is following)
                const isPrivate = userRes.data.privacidade_padrao === 2;
                const canSee = !isPrivate || userRes.data.follow_status === 'following' || userRes.data.id_usuario === profileRes.data.id_usuario;

                if (canSee) {
                    const dreamsRes = await getDreams('foryou');
                    const filtered = dreamsRes.data.filter(d => d.usuario.id_usuario === parseInt(id));
                    setUserDreams(filtered);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleFollowToggle = async () => {
        setFollowLoading(true);
        try {
            if (followStatus === 'following' || followStatus === 'pending') {
                await unfollowUser(id);
                setFollowStatus('none');
                if (followStatus === 'following') {
                    setUser(prev => ({
                        ...prev,
                        seguidores_count: prev.seguidores_count - 1
                    }));
                }
            } else {
                const response = await followUser(id);
                const newStatus = response.data.follow_status || 'following';
                setFollowStatus(newStatus);
                if (newStatus === 'following') {
                    setUser(prev => ({
                        ...prev,
                        seguidores_count: prev.seguidores_count + 1
                    }));
                }
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setFollowLoading(false);
        }
    };

    const formatDate = (dateString, type = 'join') => {
        if (!dateString) return 'Data não informada';
        const dateValue = dateString.includes('T') ? dateString : `${dateString}T12:00:00`;
        const date = new Date(dateValue);
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

        if (type === 'birth') {
            return `Nascido em ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
        }
        return `Membro desde ${months[date.getMonth()]} de ${date.getFullYear()}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Usuário não encontrado</p>
                <Link to="/" className="text-purple-400 hover:underline mt-4 inline-block">
                    Voltar ao feed
                </Link>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id_usuario === user.id_usuario;
    const avatarUrl = user.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg';

    return (
        <div className="min-h-screen">
            {/* Back Button */}
            <Link to="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
                <FaArrowLeft />
                <span>Voltar</span>
            </Link>

            {/* Banned User Alert */}
            {user.is_banned && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="text-lg font-bold text-red-500">Usuário Banido</h3>
                    </div>
                    <p className="text-gray-300">
                        O usuário desta conta foi banido por: <strong className="text-red-400">{user.ban_reason}</strong>
                    </p>
                </div>
            )}

            {/* Profile Header */}
            <div className="relative bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-xl p-8 mb-6 overflow-hidden text-white">
                {/* Background Image Overlay */}
                <div
                    className="absolute top-0 left-0 right-0 bottom-0 opacity-20 z-0"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80')",
                        backgroundPosition: 'center',
                        backgroundSize: 'cover'
                    }}
                />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-white object-cover"
                    />

                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                        <h1 className="text-3xl font-bold mb-2">
                            {user.nome_completo || 'Usuário'}
                        </h1>
                        <h2 className="text-lg mb-4 opacity-90">
                            @{user.nome_usuario || 'username'}
                        </h2>
                        <p className="mb-4 leading-relaxed max-w-2xl">
                            {user.bio || 'Este usuário ainda não adicionou uma bio.'}
                        </p>

                        <div className="flex gap-6 flex-wrap mb-4 justify-center md:justify-start">
                            <div className="flex items-center gap-2 text-sm">
                                <FaCalendarAlt className="opacity-90" />
                                <span>{formatDate(user.data_criacao, 'join')}</span>
                            </div>
                            {user.data_nascimento && (
                                <div className="flex items-center gap-2 text-sm">
                                    <FaBirthdayCake className="opacity-90" />
                                    <span>{formatDate(user.data_nascimento, 'birth')}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-8 mb-6 justify-center md:justify-start">
                            <div className="text-center md:text-left">
                                <div className="text-xl font-bold">{userDreams.length}</div>
                                <div className="text-sm opacity-90">Sonhos</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-xl font-bold">{user.seguidores_count || 0}</div>
                                <div className="text-sm opacity-90">Seguidores</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-xl font-bold">{user.seguindo_count || 0}</div>
                                <div className="text-sm opacity-90">Seguindo</div>
                            </div>
                        </div>

                        {!isOwnProfile && (
                            <button
                                onClick={handleFollowToggle}
                                disabled={followLoading}
                                className={`px-8 py-3 rounded-full font-semibold transition-all ${followStatus === 'following'
                                    ? 'bg-white/20 backdrop-blur-sm text-white border-2 border-white hover:bg-white/30'
                                    : followStatus === 'pending'
                                        ? 'bg-gray-400/30 backdrop-blur-sm text-white border-2 border-gray-300'
                                        : 'bg-white text-[#764ba2] hover:bg-white/90'
                                    } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {followLoading
                                    ? 'Carregando...'
                                    : followStatus === 'following'
                                        ? 'Seguindo ✓'
                                        : followStatus === 'pending'
                                            ? 'Solicitado ⏳'
                                            : 'Seguir'
                                }
                            </button>
                        )}

                        {isOwnProfile && (
                            <Link
                                to="/profile"
                                className="px-6 py-3 bg-white text-[#764ba2] rounded-full font-semibold hover:bg-white/90 transition-colors"
                            >
                                Ver meu perfil
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* User's Dreams */}
            <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sonhos de {user.nome_usuario}</h3>

                {/* Protected Posts Message for Private Accounts */}
                {user.privacidade_padrao === 2 && followStatus !== 'following' && !isOwnProfile ? (
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center">
                        <FaLock className="text-4xl text-gray-500 mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-white mb-2">Esses posts estão protegidos</h4>
                        <p className="text-gray-400 mb-4">
                            Somente seguidores aprovados podem ver os posts de @{user.nome_usuario}. Para solicitar acesso, clique em Seguir.
                        </p>
                        {followStatus === 'pending' && (
                            <p className="text-amber-400 text-sm">Solicitação pendente de aprovação</p>
                        )}
                    </div>
                ) : userDreams.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">Este usuário ainda não compartilhou sonhos públicos.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {userDreams.map(dream => (
                            <DreamCard
                                key={dream.id_publicacao}
                                dream={dream}
                                currentUserId={currentUser?.id_usuario}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
