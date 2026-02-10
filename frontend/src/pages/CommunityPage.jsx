import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DreamCard from '../components/DreamCard';
import { getCommunity, joinCommunity, leaveCommunity, deleteCommunity, getDreams, uploadCommunityIcon, uploadCommunityBanner, updateCommunity, inviteModerator, search } from '../services/api';
import { FaBirthdayCake, FaEllipsisH, FaChevronDown, FaChevronUp, FaPlus, FaPen, FaEnvelope, FaUserPlus, FaTrash, FaCamera, FaTimes, FaSearch, FaSpinner } from 'react-icons/fa';

const CommunityPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUserId = JSON.parse(localStorage.getItem('user'))?.id_usuario;

    const [community, setCommunity] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploadingIcon, setUploadingIcon] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const bannerInputRef = useRef(null);
    const iconInputRef = useRef(null);
    const [showMenu, setShowMenu] = useState(false);

    // Widget edit state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);

    // Rules edit state
    const [showRulesModal, setShowRulesModal] = useState(false);
    const [editRules, setEditRules] = useState([]);
    const [savingRules, setSavingRules] = useState(false);

    // Rules expand state
    const [expandedRule, setExpandedRule] = useState(null);

    // Invite mod state
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteSearch, setInviteSearch] = useState('');
    const [inviteResults, setInviteResults] = useState([]);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [invitingUserId, setInvitingUserId] = useState(null);

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

    const handleJoinLeave = async () => {
        try {
            const response = community.is_member 
                ? await leaveCommunity(id)
                : await joinCommunity(id);
            setCommunity(prev => ({
                ...prev,
                is_member: response.data.is_member,
                membros_count: response.data.membros_count
            }));
        } catch (err) {
            console.error('Error joining/leaving community:', err);
            alert(err.response?.data?.error || 'Erro ao processar solicitação');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Tem certeza que deseja excluir esta comunidade? Esta ação não pode ser desfeita.')) {
            return;
        }
        try {
            await deleteCommunity(id);
            alert('Comunidade excluída com sucesso!');
            navigate('/communities');
        } catch (err) {
            console.error('Error deleting community:', err);
            alert(err.response?.data?.error || 'Erro ao excluir comunidade');
        }
    };

    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingBanner(true);
        try {
            const res = await uploadCommunityBanner(id, file);
            setCommunity(prev => ({ ...prev, banner: res.data.banner }));
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao alterar banner');
        } finally {
            setUploadingBanner(false);
            e.target.value = '';
        }
    };

    const handleIconUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingIcon(true);
        try {
            const res = await uploadCommunityIcon(id, file);
            setCommunity(prev => ({ ...prev, imagem: res.data.imagem }));
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao alterar ícone');
        } finally {
            setUploadingIcon(false);
            e.target.value = '';
        }
    };

    // ========== Widget Edit Handlers ==========
    const openEditModal = () => {
        setEditName(community.nome);
        setEditDesc(community.descricao);
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        setSavingEdit(true);
        try {
            const res = await updateCommunity(id, { nome: editName, descricao: editDesc });
            setCommunity(res.data);
            setShowEditModal(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao salvar alterações');
        } finally {
            setSavingEdit(false);
        }
    };

    // ========== Rules Edit Handlers ==========
    const openRulesModal = () => {
        setEditRules(community.regras && community.regras.length > 0
            ? community.regras.map(r => ({ ...r }))
            : [{ title: '', description: '' }]
        );
        setShowRulesModal(true);
    };

    const handleAddRule = () => {
        setEditRules(prev => [...prev, { title: '', description: '' }]);
    };

    const handleRemoveRule = (idx) => {
        setEditRules(prev => prev.filter((_, i) => i !== idx));
    };

    const handleRuleChange = (idx, field, value) => {
        setEditRules(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    };

    const handleSaveRules = async () => {
        // Filter out empty rules
        const validRules = editRules.filter(r => r.title.trim());
        setSavingRules(true);
        try {
            const res = await updateCommunity(id, { regras: validRules });
            setCommunity(res.data);
            setShowRulesModal(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao salvar regras');
        } finally {
            setSavingRules(false);
        }
    };

    // ========== Invite Mod Handlers ==========
    const inviteSearchTimeoutRef = useRef(null);
    const inviteSearchSeqRef = useRef(0);

    useEffect(() => {
        return () => {
            if (inviteSearchTimeoutRef.current) {
                clearTimeout(inviteSearchTimeoutRef.current);
            }
        };
    }, []);

    const handleInviteSearch = (q) => {
        setInviteSearch(q);

        // Clear any pending debounce timer
        if (inviteSearchTimeoutRef.current) {
            clearTimeout(inviteSearchTimeoutRef.current);
            inviteSearchTimeoutRef.current = null;
        }

        // If the query is too short, reset results and loading state
        if (q.length < 2) {
            // Invalidate any in-flight searches
            inviteSearchSeqRef.current += 1;
            setInviteResults([]);
            setInviteLoading(false);
            return;
        }

        // Debounce the search to avoid firing on every keystroke
        inviteSearchTimeoutRef.current = setTimeout(() => {
            const currentSeq = inviteSearchSeqRef.current + 1;
            inviteSearchSeqRef.current = currentSeq;

            setInviteLoading(true);

            (async () => {
                try {
                    const res = await search(q, 'users', 10);
                    // Only apply results if this is the latest search
                    if (inviteSearchSeqRef.current === currentSeq) {
                        setInviteResults(res.data?.results?.users || []);
                    }
                } catch (err) {
                    console.error('Search error:', err);
                } finally {
                    if (inviteSearchSeqRef.current === currentSeq) {
                        setInviteLoading(false);
                    }
                }
            })();
        }, 300);
    };

    const handleInviteMod = async (userId) => {
        setInvitingUserId(userId);
        try {
            await inviteModerator(id, userId);
            // Refresh community data to update moderators list
            const res = await getCommunity(id);
            setCommunity(res.data);
            setShowInviteModal(false);
            setInviteSearch('');
            setInviteResults([]);
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao convidar moderador');
        } finally {
            setInvitingUserId(null);
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
            {/* Hidden file inputs */}
            <input type="file" ref={bannerInputRef} accept="image/*" className="hidden" onChange={handleBannerUpload} />
            <input type="file" ref={iconInputRef} accept="image/*" className="hidden" onChange={handleIconUpload} />

            {/* 1. Reddit-style Banner */}
            <div className="h-48 w-full bg-gray-700 relative group">
                {community.banner ? (
                    <img
                        src={community.banner}
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-900"></div>
                )}

                {community.is_moderator && (
                    <button
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={uploadingBanner}
                        className="absolute right-4 top-4 bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        title="Alterar Banner"
                    >
                        {uploadingBanner ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <FaCamera />
                        )}
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
                            {community.is_moderator && (
                                <button
                                    onClick={() => iconInputRef.current?.click()}
                                    disabled={uploadingIcon}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                                >
                                    {uploadingIcon ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <FaCamera size={18} className="text-blue-400" />
                                    )}
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
                                    onClick={() => navigate(`/community/${id}/submit`)}
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
                                                handleJoinLeave();
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
                                                {(community.is_moderator || community.is_admin) && (
                                                    <button
                                                        onClick={() => navigate(`/community/${id}/mod-dashboard`)}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-blue-500 font-bold text-sm"
                                                    >
                                                        FERRAMENTAS DE MODERAÇÃO
                                                    </button>
                                                )}
                                                {community.is_admin && (
                                                    <button
                                                        onClick={() => {
                                                            handleDelete();
                                                            setShowMenu(false);
                                                        }}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-red-600 font-bold text-sm flex items-center gap-2"
                                                    >
                                                        <FaTrash size={12} />
                                                        EXCLUIR COMUNIDADE
                                                    </button>
                                                )}
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
                    <div className="bg-white dark:bg-[#1a1a1b] rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden text-gray-700 dark:text-gray-300">

                        {/* 1. Header Area */}
                        <div className="p-4 pb-0">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-base font-bold text-gray-900 dark:text-gray-200">{community.nome}</h2>
                                {community.is_moderator && (
                                    <FaPen className="cursor-pointer text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" onClick={openEditModal} size={12} />
                                )}
                            </div>
                            <p className="text-sm mb-4 leading-relaxed text-gray-500 dark:text-gray-400">
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
                            <div className="border-t border-gray-200 dark:border-gray-700/50 pt-4 pb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase">Estatísticas</h3>
                                    <span className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Da última semana &gt;</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xl font-medium text-gray-900 dark:text-white">
                                            {community.membros_count}
                                        </div>
                                        <div className="text-xs text-gray-500">Visitantes</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                            12
                                        </div>
                                        <div className="text-xs text-gray-500">Contribuição</div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Separator */}
                        <div className="h-px bg-gray-200 dark:bg-gray-700/50 w-full"></div>

                        {/* Rules Section */}
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-500 text-xs uppercase">Regras do r/{community.nome}</h3>
                                {community.is_moderator && <FaPen className="cursor-pointer text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" onClick={openRulesModal} size={12} />}
                            </div>

                            {community.regras && community.regras.length > 0 ? (
                                <div className="space-y-1">
                                    {community.regras.map((rule, idx) => (
                                        <div key={idx} className="group border-b border-gray-200 dark:border-gray-800 last:border-0">
                                            <div
                                                className="py-2 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors px-1 rounded"
                                                onClick={() => setExpandedRule(expandedRule === idx ? null : idx)}
                                            >
                                                <div className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                    <span className="font-bold min-w-[15px]">{idx + 1}</span>
                                                    <span className="font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{rule.title}</span>
                                                </div>
                                                {expandedRule === idx ? (
                                                    <FaChevronUp size={10} className="text-gray-500" />
                                                ) : (
                                                    <FaChevronDown size={10} className="text-gray-500" />
                                                )}
                                            </div>
                                            {expandedRule === idx && rule.description && (
                                                <div className="px-1 pb-3 text-xs text-gray-500 dark:text-gray-400 ml-6 leading-relaxed">
                                                    {rule.description}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 italic py-2 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded">
                                    Nenhuma regra definida
                                </div>
                            )}
                        </div>

                        {/* Separator */}
                        <div className="h-px bg-gray-200 dark:bg-gray-700/50 w-full"></div>

                        {/* Moderators Section */}
                        <div className="p-4">
                            <h3 className="font-bold text-gray-500 text-xs uppercase mb-4">Moderadores</h3>
                            <button className="w-full py-2 mb-4 bg-indigo-700 hover:bg-indigo-600 text-white rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-900/20">
                                <FaEnvelope />
                                Contatar a moderação
                            </button>

                            {community.is_admin && (
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors mb-4 ml-1"
                                >
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
                                        {mod.role === 'admin' && (
                                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold">ADMIN</span>
                                        )}
                                    </div>
                                ))}
                                {!community.moderators && (
                                    <div className="text-xs text-gray-500 italic">Lista de moderadores indisponível</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== MODALS ===== */}

            {/* Edit Community Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white dark:bg-[#1a1a1b] rounded-xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Editar Comunidade</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da comunidade</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#272729] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    maxLength={100}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                                <textarea
                                    value={editDesc}
                                    onChange={e => setEditDesc(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#272729] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                            <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={savingEdit || !editName.trim()}
                                className="px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {savingEdit && <FaSpinner className="animate-spin" size={12} />}
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rules Edit Modal */}
            {showRulesModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowRulesModal(false)}>
                    <div className="bg-white dark:bg-[#1a1a1b] rounded-xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Editar Regras</h3>
                            <button onClick={() => setShowRulesModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="p-4 space-y-4 overflow-y-auto flex-1">
                            {editRules.map((rule, idx) => (
                                <div key={idx} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#272729] space-y-2 relative group">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-indigo-500 min-w-[20px]">{idx + 1}.</span>
                                        <input
                                            type="text"
                                            value={rule.title}
                                            onChange={e => handleRuleChange(idx, 'title', e.target.value)}
                                            placeholder="Título da regra"
                                            className="flex-1 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1a1b] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        />
                                        <button
                                            onClick={() => handleRemoveRule(idx)}
                                            className="text-red-400 hover:text-red-600 transition-colors p-1"
                                            title="Remover regra"
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    </div>
                                    <textarea
                                        value={rule.description || ''}
                                        onChange={e => handleRuleChange(idx, 'description', e.target.value)}
                                        placeholder="Descrição (opcional)"
                                        rows={2}
                                        className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1a1b] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                                    />
                                </div>
                            ))}
                            <button
                                onClick={handleAddRule}
                                className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:text-indigo-500 hover:border-indigo-500 transition-colors flex items-center justify-center gap-2"
                            >
                                <FaPlus size={10} />
                                Adicionar regra
                            </button>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                            <button onClick={() => setShowRulesModal(false)} className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveRules}
                                disabled={savingRules}
                                className="px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {savingRules && <FaSpinner className="animate-spin" size={12} />}
                                Salvar Regras
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Moderator Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowInviteModal(false)}>
                    <div className="bg-white dark:bg-[#1a1a1b] rounded-xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Convidar Moderador</h3>
                            <button onClick={() => { setShowInviteModal(false); setInviteSearch(''); setInviteResults([]); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="relative mb-4">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    value={inviteSearch}
                                    onChange={e => handleInviteSearch(e.target.value)}
                                    placeholder="Buscar usuário por nome..."
                                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#272729] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    autoFocus
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {inviteLoading ? (
                                    <div className="flex justify-center py-4">
                                        <FaSpinner className="animate-spin text-indigo-500" size={20} />
                                    </div>
                                ) : inviteResults.length > 0 ? (
                                    <div className="space-y-1">
                                        {inviteResults.map(user => (
                                            <div key={user.id_usuario} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500 overflow-hidden flex items-center justify-center">
                                                        {user.avatar_url ? (
                                                            <img src={user.avatar_url} alt={user.nome_usuario} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-white font-bold text-xs">{user.nome_usuario?.charAt(0).toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.nome_usuario}</div>
                                                        <div className="text-xs text-gray-500">{user.nome_completo}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleInviteMod(user.id_usuario)}
                                                    disabled={invitingUserId === user.id_usuario}
                                                    className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors disabled:opacity-50 flex items-center gap-1"
                                                >
                                                    {invitingUserId === user.id_usuario ? (
                                                        <FaSpinner className="animate-spin" size={10} />
                                                    ) : (
                                                        <FaUserPlus size={10} />
                                                    )}
                                                    Convidar
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : inviteSearch.length >= 2 ? (
                                    <div className="text-center text-sm text-gray-500 py-4">
                                        Nenhum usuário encontrado
                                    </div>
                                ) : (
                                    <div className="text-center text-sm text-gray-500 py-4">
                                        Digite pelo menos 2 caracteres para buscar
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityPage;
