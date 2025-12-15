import React, { useState } from 'react';
import { FaBell, FaHeart, FaComment, FaUserPlus, FaCheck, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const navigate = useNavigate();

    // Mock notifications data - TO DO: Replace with real API data
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'follower',
            user: { name: 'Maria Silva', avatar: 'https://randomuser.me/api/portraits/women/32.jpg' },
            message: 'começou a seguir você',
            time: '2 min atrás',
            read: false,
        },
        {
            id: 2,
            type: 'like',
            user: { name: 'João Pedro', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
            message: 'curtiu seu sonho "Voando sobre montanhas"',
            time: '15 min atrás',
            read: false,
        },
        {
            id: 3,
            type: 'comment',
            user: { name: 'Ana Costa', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
            message: 'comentou: "Que sonho incrível! Eu também já tive algo parecido..."',
            time: '1 hora atrás',
            read: true,
        },
        {
            id: 4,
            type: 'follower',
            user: { name: 'Carlos Mendes', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
            message: 'começou a seguir você',
            time: '3 horas atrás',
            read: true,
        },
        {
            id: 5,
            type: 'like',
            user: { name: 'Beatriz Lima', avatar: 'https://randomuser.me/api/portraits/women/55.jpg' },
            message: 'curtiu seu sonho "O labirinto misterioso"',
            time: '5 horas atrás',
            read: true,
        },
    ]);

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

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <FaArrowLeft className="text-gray-300" />
                    </button>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
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

            {/* Demo Banner */}
            <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                <FaInfoCircle className="text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-yellow-200 text-sm font-medium">Dados de demonstração</p>
                    <p className="text-yellow-200/70 text-xs mt-1">
                        Estas notificações são exemplos. Em breve você receberá notificações reais quando alguém interagir com você!
                    </p>
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
                {notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <FaBell className="text-6xl text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">Nenhuma notificação ainda</p>
                        <p className="text-gray-500">Quando alguém interagir com você, aparecerá aqui</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${!notification.read ? 'bg-white/5 border-l-4 border-primary' : ''
                                }`}
                        >
                            {/* User Avatar */}
                            <div className="relative">
                                <img
                                    src={notification.user.avatar}
                                    alt={notification.user.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                                    {getIcon(notification.type)}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white">
                                    <span className="font-semibold">
                                        {notification.user.name}
                                    </span>{' '}
                                    <span className="text-gray-300">{notification.message}</span>
                                </p>
                                <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                            </div>

                            {/* Unread Indicator */}
                            {!notification.read && (
                                <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
