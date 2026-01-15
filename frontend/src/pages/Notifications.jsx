import React, { useState, useEffect } from 'react';
import { FaBell, FaHeart, FaComment, FaUserPlus, FaCheck, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { getNotifications, markAllNotificationsRead } from '../services/api';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await getNotifications();
            setNotifications(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Erro ao carregar notificações');
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'follower':
                return <FaUserPlus className="text-blue-400" />;
            case 'like':
                return <FaHeart className="text-red-400" />;
            case 'comment':
                return <FaComment className="text-green-400" />;
            default:
                return <FaBell className="text-primary" />;
        }
    };

    const getMessage = (notification) => {
        switch (notification.tipo_notificacao_display) {
            case 'follower':
                return 'começou a seguir você';
            case 'like':
                return `curtiu seu sonho "${notification.conteudo || 'seu sonho'}"`;
            case 'comment':
                return `comentou: "${notification.conteudo || ''}"`;
            default:
                return notification.conteudo || 'interagiu com você';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'agora';
        if (diffMins < 60) return `${diffMins} min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays < 7) return `${diffDays}d atrás`;
        return date.toLocaleDateString('pt-BR');
    };

    const markAllAsRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const unreadCount = notifications.filter(n => !n.lida).length;

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <FaArrowLeft className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FaBell className="text-primary" />
                        Notificações
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        <FaCheck />
                        Marcar todas como lidas
                    </button>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="text-center py-12">
                    <p className="text-red-400">{error}</p>
                    <button onClick={fetchNotifications} className="text-primary mt-2 hover:underline">
                        Tentar novamente
                    </button>
                </div>
            )}

            {/* Notifications List */}
            {!loading && !error && (
                <div className="space-y-2">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <FaBell className="text-6xl text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhuma notificação ainda</p>
                            <p className="text-gray-400 dark:text-gray-500">Quando alguém interagir com você, aparecerá aqui</p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <Link
                                key={notification.id_notificacao}
                                to={notification.id_referencia ? `/dream/${notification.id_referencia}` : `/user/${notification.usuario_origem?.id_usuario}`}
                                className={`flex items-start gap-4 p-4 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-white/5 ${!notification.lida ? 'bg-gray-100 dark:bg-white/5 border-l-4 border-primary' : ''
                                    }`}
                            >
                                {/* User Avatar */}
                                <div className="relative">
                                    <img
                                        src={notification.usuario_origem?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                                        alt={notification.usuario_origem?.nome_completo}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 shadow flex items-center justify-center">
                                        {getIcon(notification.tipo_notificacao_display)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-900 dark:text-white">
                                        <span className="font-semibold">
                                            {notification.usuario_origem?.nome_completo || 'Alguém'}
                                        </span>{' '}
                                        <span className="text-gray-600 dark:text-gray-300">{getMessage(notification)}</span>
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{formatDate(notification.data_criacao)}</p>
                                </div>

                                {/* Unread Indicator */}
                                {!notification.lida && (
                                    <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                                )}
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications;

