import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DreamCard from '../components/DreamCard';
import { getCommunity, joinCommunity, getDreams } from '../services/api';
import { FaBirthdayCake, FaEllipsisH, FaChevronDown, FaPlus, FaPen, FaEnvelope, FaUserPlus } from 'react-icons/fa';

const CommunityPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUserId = JSON.parse(localStorage.getItem('user'))?.id_usuario;

    const [community, setCommunity] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
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

        loadData();
    }, [id]);

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
        <div className="flex flex-col min-h-screen">
            {/* 1. Reddit-style Banner */}
            <div className="h-48 w-full bg-gray-700 relative group">
                {community.imagem ? (
                    <img
                        src={community.imagem}
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-900"></div>
                )}

                {/* 4. Moderator Edit Button on Banner */}
                {community.is_moderator && (
                    <button
                        onClick={() => alert('Alterar banner (Em breve)')}
                        className="absolute right-4 top-4 bg-blue-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Alterar Banner"
                    >
                        <FaPlus />
                    </button>
                )}
            </div>

            {/* 2. Title Bar / Header Info */}
            <div className="bg-white dark:bg-[#1a1a1b] border-b border-gray-200 dark:border-gray-700 mb-6">
                <div className="max-w-6xl mx-auto px-4 pb-4">
                    <div className="flex items-end -mt-8 mb-2">
                        {/* Community Icon */}
                        <div className="w-20 h-20 rounded-full border-4 border-white dark:border-[#1a1a1b] bg-gray-200 overflow-hidden relative z-10 group">
                            {community.imagem ? (
                                <img src={community.imagem} alt="Icon" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary text-white text-2xl font-bold">
                                    {community.nome.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {/* Moderator Edit Button on Icon */}
                            {community.is_moderator && (
                                <button
                                    onClick={() => alert('Alterar ícone (Em breve)')}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <FaPlus size={20} className="text-blue-500" />
                                </button>
                            )}
                        </div>

                        {/* Title & Actions */}
                        <div className="flex-1 ml-4 flex justify-between items-end pb-1">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {community.nome}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {community.descricao}
                                </p>
                            </div>

                            <div className="flex gap-2 items-center relative">
                                {/* Create Post Button */}
                                <button
                                    onClick={() => navigate('/create-post')}
                                    className="px-4 py-2 rounded-full font-bold bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white transition-colors flex items-center gap-2"
                                >
                                    <FaPlus />
                                    <span>Criar Post</span>
                                </button>

                                {/* More Options Button (...) */}
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                >
                                    <FaEllipsisH />
                                </button>

                                {/* Dropdown Menu */}
                                {showMenu && (
                                    <div className="absolute top-12 right-0 bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 w-48 z-50">
                                        <button
                                            onClick={() => {
                                                handleJoin();
                                                setShowMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-sm"
                                        >
                                            {community.is_member ? 'Sair da Comunidade' : 'Entrar na Comunidade'}
                                        </button>
                                        {community.is_member && (
                                            <>
                                                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-sm">
                                                    Silenciar Comunidade
                                                </button>
                                                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-sm">
                                                    Adicionar aos Favoritos
                                                </button>
                                                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-red-500 text-sm">
                                                    Denunciar
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/community/${id}/mod-dashboard`)}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-blue-500 font-bold text-sm"
                                                >
                                                    FERRAMENTAS DE MODERAÇÃO
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Main Content Grid */}
            <div className="max-w-6xl mx-auto px-4 w-full flex flex-col lg:flex-row gap-6">

                {/* Left Content: Feed (2/3) */}
                <div className="flex-1 min-w-0 flex flex-col gap-6">

                    {/* Post Input REMOVED */}

                    {/* Posts Feed */}
                    <div className="flex flex-col gap-4">
                        {posts.length > 0 ? (
                            posts.map((dream) => (
                                <DreamCard
                                    key={dream.id_publicacao}
                                    dream={dream}
                                    currentUserId={currentUserId}
                                />
                            ))
                        ) : (
                            <div className="bg-white dark:bg-[#1a1a1b] rounded border border-gray-200 dark:border-gray-700 p-12 text-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Não há posts por enquanto</h3>
                                <p className="text-gray-500 dark:text-gray-400">Seja o primeiro a compartilhar um sonho nesta comunidade!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar (1/3) */}
                <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">

                    {/* Integrated Sidebar Card */}
                    <div className="bg-[#1a1a1b] rounded-md border border-gray-700 overflow-hidden text-gray-300">

                        {/* 1. Header Area aligned with content */}
                        <div className="p-4 pb-0">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-base font-bold text-gray-200">{community.nome}</h2>
                                {community.is_moderator && (
                                    <FaPen className="cursor-pointer hover:text-white" onClick={() => alert('Editar widget (Em breve)')} size={12} />
                                )}
                            </div>
                            <p className="text-sm mb-4 leading-relaxed text-gray-400">
                                {community.descricao}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                <FaBirthdayCake />
                                Criada em {new Date(community.data_criacao).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full border border-gray-500"></div> Pública</span>
                            </div>

                            <button className="w-full py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-full font-bold text-sm transition-colors mb-6 shadow-md shadow-indigo-900/20 flex items-center justify-center gap-2">
                                <FaBirthdayCake size={14} />
                                Guia da comunidade
                            </button>

                            {/* Stats */}
                            <div className="border-t border-gray-700/50 pt-4 pb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase">Estatísticas</h3>
                                    <span className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">Da última semana &gt;</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xl font-medium text-white">
                                            {community.membros_count}
                                        </div>
                                        <div className="text-xs text-gray-500">Visitantes</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-medium text-white flex items-center gap-1">
                                            12
                                        </div>
                                        <div className="text-xs text-gray-500">Contribuição</div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Separator */}
                        <div className="h-px bg-gray-700/50 w-full"></div>

                        {/* Rules Section */}
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-500 text-xs uppercase">Regras do r/{community.nome}</h3>
                                {community.is_moderator && <FaPen className="cursor-pointer text-gray-500 hover:text-white" size={12} />}
                            </div>

                            {community.regras && community.regras.length > 0 ? (
                                <div className="space-y-1">
                                    {community.regras.map((rule, idx) => (
                                        <div key={idx} className="group border-b border-gray-800 last:border-0">
                                            <div className="py-2 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors px-1 rounded">
                                                <div className="flex gap-2 text-sm text-gray-300">
                                                    <span className="font-bold min-w-[15px]">{idx + 1}</span>
                                                    <span className="font-medium group-hover:text-white transition-colors">{rule.title}</span>
                                                </div>
                                                <FaChevronDown size={10} className="text-gray-500" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 italic py-2 text-center border border-dashed border-gray-700 rounded">
                                    Nenhuma regra definida
                                </div>
                            )}
                        </div>

                        {/* Separator */}
                        <div className="h-px bg-gray-700/50 w-full"></div>

                        {/* Moderators Section */}
                        <div className="p-4">
                            <h3 className="font-bold text-gray-500 text-xs uppercase mb-4">Moderadores</h3>
                            <button className="w-full py-2 mb-4 bg-indigo-700 hover:bg-indigo-600 text-white rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-900/20">
                                <FaEnvelope />
                                Contatar a moderação
                            </button>

                            {community.is_moderator && (
                                <button className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors mb-4 ml-1">
                                    <div className="p-1 rounded bg-indigo-500/10">
                                        <FaUserPlus size={10} />
                                    </div>
                                    Convidar mod
                                </button>
                            )}

                            <div className="space-y-3">
                                {community.moderators && community.moderators.map((mod) => (
                                    <div key={mod.id} className="flex items-center gap-2 text-sm text-indigo-400 hover:underline cursor-pointer">
                                        <div className="w-6 h-6 rounded bg-indigo-500 overflow-hidden flex items-center justify-center">
                                            {mod.avatar ? (
                                                <img src={mod.avatar} alt={mod.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white font-bold text-xs">u/</span>
                                            )}
                                        </div>
                                        <span>u/{mod.username}</span>
                                    </div>
                                ))}
                                {/* Fallback if no mods list from backend yet (legacy support) */}
                                {!community.moderators && (
                                    <div className="text-xs text-gray-500 italic">Lista de moderadores indisponível</div>

                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
