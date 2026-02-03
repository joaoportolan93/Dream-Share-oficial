import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    FaRegComment, FaRetweet, FaHeart, FaRegHeart, FaChartBar, 
    FaBookmark, FaRegBookmark, FaShare, FaEllipsisH,
    FaEdit, FaTrash, FaFlag, FaBan, FaVolumeMute,
    FaCheck, FaTimes, FaPlay
} from 'react-icons/fa';
import { likeComment, editComment, deleteComment } from '../services/api';

const Comment = ({
    comment,
    dreamId,
    currentUserId,
    postOwnerId,
    postOwnerUsername,
    onDelete,
    onUpdate,
    onReply,
    onReport,
    depth = 0,
    maxDepth = 3,
    showThreadLine = true
}) => {
    const [isLiked, setIsLiked] = useState(comment.is_liked || false);
    const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.conteudo_texto || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const isOwner = comment.usuario?.id_usuario === currentUserId;
    const canEdit = comment.can_edit;
    const canDelete = comment.can_delete;
    const hasReplies = comment.respostas && comment.respostas.length > 0;

    // Format relative date
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
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    // Format large numbers (1.2K, 3.4M, etc.)
    const formatCount = (num) => {
        if (!num) return '';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    // Build "Em resposta a" text
    const getReplyingToText = () => {
        if (!comment.replying_to) return null;
        
        const commentAuthor = comment.replying_to.comment_author?.nome_usuario;
        const postOwner = comment.replying_to.post_owner?.nome_usuario;
        
        if (postOwner && commentAuthor !== postOwner) {
            return (
                <span className="text-gray-500 text-xs mb-1 block">
                    Em resposta a{' '}
                    <span className="text-primary hover:underline cursor-pointer">@{commentAuthor}</span>
                    {' e '}
                    <span className="text-primary hover:underline cursor-pointer">@{postOwner}</span>
                </span>
            );
        }
        
        if (commentAuthor) {
            return (
                <span className="text-gray-500 text-xs mb-1 block">
                    Em resposta a{' '}
                    <span className="text-primary hover:underline cursor-pointer">@{commentAuthor}</span>
                </span>
            );
        }
        
        return null;
    };

    // Handle like
    const handleLike = async () => {
        try {
            const response = await likeComment(dreamId, comment.id_comentario);
            setIsLiked(response.data.is_liked);
            setLikesCount(response.data.likes_count);
        } catch (err) {
            console.error('Error liking comment:', err);
        }
    };

    // Handle edit
    const handleEdit = async () => {
        if (!editText.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await editComment(dreamId, comment.id_comentario, editText.trim());
            onUpdate(comment.id_comentario, editText.trim());
            setIsEditing(false);
        } catch (err) {
            console.error('Error editing comment:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!window.confirm('Excluir este comentário?')) return;
        try {
            await deleteComment(dreamId, comment.id_comentario);
            onDelete(comment.id_comentario);
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    // Handle save/bookmark
    const handleSave = () => {
        setIsSaved(!isSaved);
        // TODO: Implement save to backend
    };

    // Handle share
    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(
                `${window.location.origin}/dream/${dreamId}#comment-${comment.id_comentario}`
            );
            // TODO: Show toast notification
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative"
            id={`comment-${comment.id_comentario}`}
        >
            <div className="flex gap-3 py-3 px-1">
                {/* Avatar Column with Thread Line */}
                <div className="flex flex-col items-center flex-shrink-0">
                    <img
                        src={comment.usuario?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                        alt={comment.usuario?.nome_completo}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    {/* Thread Line - connects to children */}
                    {hasReplies && showThreadLine && depth < maxDepth && (
                        <div className="w-0.5 flex-1 bg-white/20 mt-2 rounded-full" />
                    )}
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                    {/* "Em resposta a" label */}
                    {getReplyingToText()}

                    {/* Header Row: Name, Handle, Time, Menu */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 flex-wrap min-w-0">
                            <span className="font-bold text-white text-sm truncate">
                                {comment.usuario?.nome_completo}
                            </span>
                            <span className="text-gray-500 text-sm truncate">
                                @{comment.usuario?.nome_usuario}
                            </span>
                            <span className="text-gray-500 text-sm">·</span>
                            <span className="text-gray-500 text-sm whitespace-nowrap">
                                {formatDate(comment.data_comentario)}
                            </span>
                            {comment.editado && (
                                <span className="text-gray-500 text-xs italic">(editado)</span>
                            )}
                        </div>

                        {/* Kebab Menu */}
                        <div className="relative flex-shrink-0">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-full transition-all"
                            >
                                <FaEllipsisH size={14} />
                            </button>

                            {showMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowMenu(false)}
                                    />
                                    <div className="absolute right-0 top-8 z-50 bg-[#16213e] border border-white/10 rounded-xl shadow-2xl py-1 min-w-[180px] overflow-hidden">
                                        {canEdit && (
                                            <button
                                                onClick={() => { setIsEditing(true); setShowMenu(false); }}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                                            >
                                                <FaEdit size={14} /> Editar
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                onClick={() => { handleDelete(); setShowMenu(false); }}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
                                            >
                                                <FaTrash size={14} /> Excluir
                                            </button>
                                        )}
                                        {!isOwner && (
                                            <>
                                                <hr className="border-white/10 my-1" />
                                                <button
                                                    onClick={() => { onReport && onReport(comment); setShowMenu(false); }}
                                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                                                >
                                                    <FaFlag size={14} /> Denunciar
                                                </button>
                                                <button
                                                    onClick={() => setShowMenu(false)}
                                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                                                >
                                                    <FaBan size={14} /> Bloquear @{comment.usuario?.nome_usuario}
                                                </button>
                                                <button
                                                    onClick={() => setShowMenu(false)}
                                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                                                >
                                                    <FaVolumeMute size={14} /> Silenciar @{comment.usuario?.nome_usuario}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Comment Content */}
                    {isEditing ? (
                        <div className="mt-2">
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-primary/50 transition-colors"
                                rows={3}
                                autoFocus
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={handleEdit}
                                    disabled={isSubmitting || !editText.trim()}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white text-sm font-medium rounded-full disabled:opacity-50 transition-colors"
                                >
                                    <FaCheck size={12} /> Salvar
                                </button>
                                <button
                                    onClick={() => { setIsEditing(false); setEditText(comment.conteudo_texto || ''); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 text-sm rounded-full transition-colors"
                                >
                                    <FaTimes size={12} /> Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Text Content */}
                            {comment.conteudo_texto && (
                                <p className="text-white text-[15px] mt-1 break-words whitespace-pre-wrap leading-relaxed">
                                    {comment.conteudo_texto}
                                </p>
                            )}

                            {/* Media Content */}
                            {(comment.imagem_url || comment.video_url) && (
                                <div className="mt-3 rounded-2xl overflow-hidden border border-white/10">
                                    {comment.imagem_url && (
                                        <img
                                            src={comment.imagem_url}
                                            alt="Anexo do comentário"
                                            className="max-w-full max-h-80 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(comment.imagem_url, '_blank')}
                                        />
                                    )}
                                    {comment.video_url && (
                                        <div className="relative group">
                                            <video
                                                src={comment.video_url}
                                                className="max-w-full max-h-80 object-cover"
                                                controls
                                                preload="metadata"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <FaPlay size={40} className="text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Action Bar - Twitter Style */}
                    {!isEditing && (
                        <div className="flex items-center justify-between mt-3 max-w-md">
                            {/* Reply */}
                            <button
                                onClick={() => onReply(comment)}
                                className="flex items-center gap-1 text-gray-500 hover:text-primary group transition-colors"
                            >
                                <span className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                                    <FaRegComment size={16} />
                                </span>
                                {comment.respostas_count > 0 && (
                                    <span className="text-xs">{formatCount(comment.respostas_count)}</span>
                                )}
                            </button>

                            {/* Repost (Visual Only) */}
                            <button
                                className="flex items-center gap-1 text-gray-500 hover:text-green-400 group transition-colors"
                            >
                                <span className="p-2 rounded-full group-hover:bg-green-400/10 transition-colors">
                                    <FaRetweet size={16} />
                                </span>
                            </button>

                            {/* Like */}
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1 group transition-colors ${
                                    isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
                                }`}
                            >
                                <span className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                                    {isLiked ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
                                </span>
                                {likesCount > 0 && (
                                    <span className="text-xs">{formatCount(likesCount)}</span>
                                )}
                            </button>

                            {/* Views */}
                            <button
                                className="flex items-center gap-1 text-gray-500 hover:text-primary group transition-colors"
                            >
                                <span className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                                    <FaChartBar size={16} />
                                </span>
                                {comment.views_count > 0 && (
                                    <span className="text-xs">{formatCount(comment.views_count)}</span>
                                )}
                            </button>

                            {/* Save & Share */}
                            <div className="flex items-center">
                                <button
                                    onClick={handleSave}
                                    className={`p-2 rounded-full transition-colors ${
                                        isSaved ? 'text-primary' : 'text-gray-500 hover:text-primary hover:bg-primary/10'
                                    }`}
                                >
                                    {isSaved ? <FaBookmark size={16} /> : <FaRegBookmark size={16} />}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                                >
                                    <FaShare size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Nested Replies */}
                    {hasReplies && depth < maxDepth && (
                        <div className="mt-2">
                            {comment.respostas.map((reply) => (
                                <Comment
                                    key={reply.id_comentario}
                                    comment={reply}
                                    dreamId={dreamId}
                                    currentUserId={currentUserId}
                                    postOwnerId={postOwnerId}
                                    postOwnerUsername={postOwnerUsername}
                                    onDelete={onDelete}
                                    onUpdate={onUpdate}
                                    onReply={onReply}
                                    onReport={onReport}
                                    depth={depth + 1}
                                    maxDepth={maxDepth}
                                    showThreadLine={true}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom border separator for root comments */}
            {depth === 0 && (
                <div className="border-b border-white/5" />
            )}
        </motion.article>
    );
};

export default Comment;
