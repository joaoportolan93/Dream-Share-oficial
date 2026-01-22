import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DreamCard from '../components/DreamCard';
import { getCommunity, joinCommunity, getDreams } from '../services/api';

const CommunityPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUserId = JSON.parse(localStorage.getItem('user'))?.id_usuario;

    const [community, setCommunity] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [commResponse, postsResponse] = await Promise.all([
                getCommunity(id),
                getDreams('community', id)
            ]);
            setCommunity(commResponse.data);
            setPosts(postsResponse.data);
        } catch (err) {
            console.error('Error loading community:', err);
            setError('Comunidade não encontrada');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            const response = await joinCommunity(id);
            setCommunity(prev => ({
                ...prev,
                is_member: response.data.is_member,
                membros_count: response.data.membros_count
            }));
        } catch (err) {
            console.error('Error joining community:', err);
        }
    };

    if (loading) return (
        <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (error || !community) return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-400 mb-4">Comunidade não encontrada</h2>
            <button onClick={() => navigate('/communities')} className="text-primary hover:underline">
                Voltar para Comunidades
            </button>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            {/* Community Header */}
            <div className="bg-white dark:bg-cosmic-card backdrop-blur-md rounded-xl overflow-hidden shadow-card dark:shadow-none border border-border dark:border-white/10">
                <div className="h-32 w-full bg-gray-200">
                    <img
                        src={community.imagem || `https://picsum.photos/seed/${community.nome}/600/200`}
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-text-main dark:text-white mb-2">{community.nome}</h1>
                            <p className="text-text-secondary dark:text-gray-300 mb-4 max-w-2xl">{community.descricao}</p>
                            <div className="flex items-center gap-4 text-sm text-text-secondary dark:text-gray-400 font-medium">
                                <span>{community.membros_count} membros</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="text-green-500 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    {/* Online count is Mocked for now */}
                                    12 online
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleJoin}
                            className={`px-6 py-2 rounded-full font-bold transition-colors shadow-glow ${community.is_member
                                    ? 'border border-primary text-primary hover:bg-primary/10'
                                    : 'bg-primary text-white hover:bg-primary-dark'
                                }`}
                        >
                            {community.is_member ? 'Sair' : 'Entrar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Post Input (Placeholder) */}
            {community.is_member && (
                <div className="bg-white dark:bg-white/5 rounded-xl p-4 shadow-card dark:shadow-none border border-border dark:border-white/10 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        {localStorage.getItem('user') ? (
                            <img
                                src={JSON.parse(localStorage.getItem('user')).avatar_url}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-300"></div>
                        )}
                    </div>
                    <input
                        type="text"
                        placeholder={`Criar post em ${community.nome}`}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-text-main dark:text-white placeholder-text-secondary"
                        readOnly
                        onClick={() => alert('Postar em comunidades será implementado em breve!')}
                    />
                </div>
            )}

            {/* Posts Feed */}
            <div className="flex flex-col gap-6">
                {posts.length > 0 ? (
                    posts.map((dream) => (
                        <DreamCard
                            key={dream.id_publicacao}
                            dream={dream}
                            currentUserId={currentUserId}
                        />
                    ))
                ) : (
                    <div className="bg-white dark:bg-white/5 rounded-xl p-8 text-center shadow-card dark:shadow-none">
                        <p className="text-text-secondary dark:text-gray-400">Ainda não há posts nesta comunidade.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;
