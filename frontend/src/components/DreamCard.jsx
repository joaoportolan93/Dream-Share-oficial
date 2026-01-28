import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaEllipsisH, FaEdit, FaTrash, FaUserFriends, FaFlag, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { deleteDream, likeDream, saveDream } from '../services/api';
import { AnimatePresence } from 'framer-motion';
import CommentSection from './CommentSection';
import ReportModal from './ReportModal';

const DreamCard = ({ dream, onDelete, onEdit, currentUserId }) => {
    const navigate = useNavigate();
    const [liked, setLiked] = useState(dream.is_liked || false);
    const [likesCount, setLikesCount] = useState(dream.likes_count || 0);
    const [showMenu, setShowMenu] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [liking, setLiking] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentsCount, setCommentsCount] = useState(dream.comentarios_count || 0);
    const [showReportModal, setShowReportModal] = useState(false);
    const [saved, setSaved] = useState(dream.is_saved || false);
    const [saving, setSaving] = useState(false);

    const isOwner = dream.usuario?.id_usuario === currentUserId;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'agora';
        if (diffMins < 60) return `${diffMins}min`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString('pt-BR');
    };

    const handleLike = async () => {
        if (liking) return;

        // Optimistic UI update
        const wasLiked = liked;
        const prevCount = likesCount;
        setLiked(!wasLiked);
        setLikesCount(wasLiked ? prevCount - 1 : prevCount + 1);
        setLiking(true);

        try {
            const response = await likeDream(dream.id_publicacao);
            // Sync with server response
            setLiked(response.data.is_liked);
            setLikesCount(response.data.likes_count);
        } catch (err) {
            // Revert on error
            console.error('Error toggling like:', err);
            setLiked(wasLiked);
            setLikesCount(prevCount);
        } finally {
            setLiking(false);
        }
    };

    const handleSave = async () => {
        if (saving) return;

        const wasSaved = saved;
        setSaved(!wasSaved);
        setSaving(true);

        try {
            const response = await saveDream(dream.id_publicacao);
            setSaved(response.data.is_saved);
        } catch (err) {
            console.error('Error toggling save:', err);
            setSaved(wasSaved);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Tem certeza que deseja excluir este sonho?')) return;
        setDeleting(true);
        try {
            await deleteDream(dream.id_publicacao);
            onDelete?.(dream.id_publicacao);
        } catch (err) {
            console.error('Error deleting dream:', err);
        } finally {
            setDeleting(false);
            setShowMenu(false);
        }
    };

    const tipoSonhoColors = {
        'Lúcido': 'bg-purple-500',
        'Pesadelo': 'bg-red-500',
        'Normal': 'bg-blue-500',
        'Recorrente': 'bg-yellow-500',
    };

    const borderClass = dream.visibilidade === 2
        ? 'border-green-500/50'
        : 'border-gray-200 dark:border-white/10';

    return (
        <div className={`
            relative group
            bg-white dark:bg-[#1a163a]/95 backdrop-blur-xl
            rounded-2xl p-6
            shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-none
            border ${borderClass}
            hover:shadow-lg hover:border-primary/30 hover:-translate-y-1
            transition-all duration-300 ease-out
        `}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Link to={`/user/${dream.usuario?.id_usuario}`}>
                        <img
                            src={dream.usuario?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                            alt={dream.usuario?.nome_completo}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-white/10"
                        />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <Link to={`/user/${dream.usuario?.id_usuario}`} className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">
                                {dream.usuario?.nome_completo}
                            </Link>
                            {dream.visibilidade === 2 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full text-green-400 text-xs font-medium" title="Melhores Amigos">
                                    <FaUserFriends size={10} /> <span>Close Friends</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            @{dream.usuario?.nome_usuario} · {formatDate(dream.data_publicacao)}
                        </p>
                    </div>
                </div>

                {/* Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <FaEllipsisH className="text-gray-500 dark:text-gray-400" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-10 min-w-[150px]">
                            {isOwner && (
                                <>
                                    <button
                                        onClick={() => { onEdit?.(dream); setShowMenu(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                    >
                                        <FaEdit /> Editar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="w-full flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <FaTrash /> {deleting ? 'Excluindo...' : 'Excluir'}
                                    </button>
                                </>
                            )}
                            {!isOwner && (
                                <button
                                    onClick={() => { setShowReportModal(true); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                                >
                                    <FaFlag /> Denunciar
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Clickable Content Area */}
            <div
                onClick={(e) => {
                    // Don't navigate if clicking on interactive elements
                    if (e.target.closest('a, button')) return;
                    navigate(`/post/${dream.id_publicacao}`);
                }}
                className="cursor-pointer"
            >
                {/* Type Badge */}
                {dream.tipo_sonho && (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-3 ${tipoSonhoColors[dream.tipo_sonho] || 'bg-gray-500'}`}>
                        {dream.tipo_sonho}
                    </span>
                )}

                {/* Title */}
                {dream.titulo && (
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{dream.titulo}</h3>
                )}

                {/* Content */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">
                    {dream.conteudo_texto}
                </p>
            </div>

            {/* Image */}
            {dream.imagem && (
                <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 dark:border-white/5">
                    <img src={dream.imagem} alt="Dream visual" className="w-full h-auto max-h-[500px] object-cover" />
                </div>
            )}


            {/* Emotions */}
            {dream.emocoes_sentidas && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {dream.emocoes_sentidas.split(',').map((emocao, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-sm text-gray-600 dark:text-gray-300">
                            {emocao.trim()}
                        </span>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-white/10">
                <button
                    onClick={handleLike}
                    disabled={liking}
                    className={`flex items-center gap-2 transition-colors ${liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`}
                >
                    {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                    <span className="text-sm font-medium">{likesCount}</span>
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-2 transition-colors ${showComments ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}
                >
                    <FaComment />
                    <span className="text-sm font-medium">{commentsCount}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                    <FaShare />
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 transition-colors ml-auto ${saved ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}
                    title={saved ? "Remover dos salvos" : "Salvar"}
                >
                    {saved ? <FaBookmark /> : <FaRegBookmark />}
                </button>
            </div>

            <AnimatePresence>
                {showComments && (
                    <CommentSection
                        dreamId={dream.id_publicacao}
                        currentUserId={currentUserId}
                        postOwnerId={dream.usuario?.id_usuario}
                    />
                )}
            </AnimatePresence>

            {/* Report Modal */}
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                contentId={dream.id_publicacao}
                contentType={1}
            />
        </div>
    );
};

export default DreamCard;
