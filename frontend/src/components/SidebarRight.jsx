import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCloud, FaFeather } from 'react-icons/fa';
import { getSuggestedUsers, followUser } from '../services/api';

const SidebarRight = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followingIds, setFollowingIds] = useState([]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const response = await getSuggestedUsers();
                setSuggestions(response.data);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions();
    }, []);

    const handleFollow = async (userId) => {
        try {
            await followUser(userId);
            setFollowingIds(prev => [...prev, userId]);
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const insights = [
        { title: 'Voar em sonhos', desc: 'Sonhar que está voando geralmente representa sensação de liberdade e controle sobre a própria vida.', icon: FaCloud },
        { title: 'Cair em sonhos', desc: 'Sensação de queda durante o sonho frequentemente está associada a inseguranças e perda de controle.', icon: FaFeather },
    ];

    return (
        <aside className="hidden lg:flex flex-col w-[320px] fixed right-0 top-[60px] bottom-0 bg-background-main dark:bg-transparent p-5 overflow-y-auto transition-colors duration-300">
            {/* Suggestions Card */}
            <div className="bg-white dark:bg-cosmic-card dark:border dark:border-white/5 rounded-xl p-5 shadow-card mb-6 transition-colors duration-300">
                <h3 className="text-text-main dark:text-white font-bold text-sm mb-4">Sugestões para seguir</h3>
                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : suggestions.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">Nenhuma sugestão no momento</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {suggestions.map((user) => (
                            <div key={user.id_usuario} className="flex items-center gap-3">
                                <Link to={`/user/${user.id_usuario}`} className="flex-shrink-0">
                                    <img
                                        src={user.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                                        alt={user.nome_usuario}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                </Link>
                                <Link to={`/user/${user.id_usuario}`} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                                    <span className="text-sm font-bold text-text-main dark:text-white block truncate">{user.nome_usuario}</span>
                                    <span className="text-xs text-text-secondary dark:text-gray-400 block truncate">
                                        {user.bio || 'Sonhador(a)'}
                                    </span>
                                </Link>
                                <button
                                    onClick={() => handleFollow(user.id_usuario)}
                                    disabled={followingIds.includes(user.id_usuario)}
                                    className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${followingIds.includes(user.id_usuario)
                                        ? 'bg-gray-600 text-gray-300 cursor-default'
                                        : 'bg-primary text-white hover:bg-primary-dark'
                                        }`}
                                >
                                    {followingIds.includes(user.id_usuario) ? 'Seguindo' : '+ Seguir'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Insights Card */}
            <div className="bg-white dark:bg-cosmic-card dark:border dark:border-white/5 rounded-xl p-5 shadow-card transition-colors duration-300">
                <h3 className="text-text-main dark:text-white font-bold text-sm mb-4">Insights de Sonhos</h3>
                <div className="flex flex-col gap-6">
                    {insights.map((item, index) => (
                        <div key={index} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-text-main dark:text-white font-bold text-sm">
                                <item.icon className="text-primary" />
                                {item.title}
                            </div>
                            <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default SidebarRight;
