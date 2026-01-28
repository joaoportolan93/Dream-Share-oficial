import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaReply, FaEllipsisH, FaPaperPlane, FaEdit, FaTrash, FaTimes, FaCheck } from 'react-icons/fa';
import { getComments, createComment, deleteComment, editComment, likeComment } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

// Individual Comment Component
const Comment = ({
    comment,
    dreamId,
    currentUserId,
    postOwnerId,
    onDelete,
    onUpdate,
    onReply,
    isReply = false
}) => {
    const [isLiked, setIsLiked] = useState(comment.is_liked);
    const [likesCount, setLikesCount] = useState(comment.likes_count);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.conteudo_texto);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLike = async () => {
        try {
            const response = await likeComment(dreamId, comment.id_comentario);
            setIsLiked(response.data.is_liked);
            setLikesCount(response.data.likes_count);
        } catch (err) {
            console.error('Error liking comment:', err);
        }
    };

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

    const handleDelete = async () => {
        if (!window.confirm('Excluir este comentário?')) return;
        try {
            await deleteComment(dreamId, comment.id_comentario);
            onDelete(comment.id_comentario);
        } catch (err) {
            console.error('Error deleting comment:', err);
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
        if (diffMins < 60) return `${diffMins}min`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString('pt-BR');
    };

    const canDelete = comment.can_delete;
    const canEdit = comment.can_edit;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`flex gap-3 py-3 ${isReply ? 'ml-10 border-l-2 border-white/10 pl-4' : 'border-b border-white/5'}`}
        >
            <img
                src={comment.usuario?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                alt={comment.usuario?.nome_completo}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white text-sm">
                        {comment.usuario?.nome_completo}
                    </span>
                    <span className="text-gray-400 text-xs">
                        @{comment.usuario?.nome_usuario}
                    </span>
                    <span className="text-gray-500 text-xs">
                        · {formatDate(comment.data_comentario)}
                    </span>
                    {comment.editado && (
                        <span className="text-gray-500 text-xs italic">
                            · Editado
                        </span>
                    )}
                </div>

                {/* Content */}
                {isEditing ? (
                    <div className="mt-2">
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-primary/50"
                            rows={2}
                            autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleEdit}
                                disabled={isSubmitting || !editText.trim()}
                                className="flex items-center gap-1 px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary text-xs rounded-full disabled:opacity-50"
                            >
                                <FaCheck size={10} /> Salvar
                            </button>
                            <button
                                onClick={() => { setIsEditing(false); setEditText(comment.conteudo_texto); }}
                                className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 text-xs rounded-full"
                            >
                                <FaTimes size={10} /> Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-300 text-sm mt-1 break-words">
                        {comment.conteudo_texto}
                    </p>
                )}

                {/* Actions */}
                {!isEditing && (
                    <div className="flex items-center gap-4 mt-2">
                        {/* Reply Button (only for root comments) */}
                        {!isReply && (
                            <button
                                onClick={() => onReply(comment)}
                                className="flex items-center gap-1 text-gray-400 hover:text-primary text-xs transition-colors"
                            >
                                <FaReply size={12} />
                                <span>Responder</span>
                            </button>
                        )}

                        {/* Like Button */}
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
                        >
                            {isLiked ? <FaHeart size={12} /> : <FaRegHeart size={12} />}
                            {likesCount > 0 && <span>{likesCount}</span>}
                        </button>

                        {/* Menu */}
                        {(canEdit || canDelete) && (
                            <div className="relative ml-auto">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                >
                                    <FaEllipsisH size={12} />
                                </button>

                                {showMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowMenu(false)}
                                        />
                                        <div className="absolute right-0 top-6 z-20 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl py-1 min-w-[120px]">
                                            {canEdit && (
                                                <button
                                                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
                                                >
                                                    <FaEdit size={12} /> Editar
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => { handleDelete(); setShowMenu(false); }}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-white/10"
                                                >
                                                    <FaTrash size={12} /> Excluir
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Replies */}
                {!isReply && comment.respostas && comment.respostas.length > 0 && (
                    <div className="mt-2">
                        {comment.respostas.map((reply) => (
                            <Comment
                                key={reply.id_comentario}
                                comment={reply}
                                dreamId={dreamId}
                                currentUserId={currentUserId}
                                postOwnerId={postOwnerId}
                                onDelete={onDelete}
                                onUpdate={onUpdate}
                                onReply={onReply}
                                isReply={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Main Comment Section Component
const CommentSection = ({ dreamId, currentUserId, postOwnerId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        fetchComments();
    }, [dreamId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await getComments(dreamId);
            setComments(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching comments:', err);
            setError('Erro ao carregar comentários');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        setSubmitting(true);
        try {
            const parentId = replyingTo?.id_comentario || null;
            const response = await createComment(dreamId, newComment.trim(), parentId);

            if (replyingTo) {
                // Add reply to the parent comment
                setComments(prevComments =>
                    prevComments.map(c => {
                        if (c.id_comentario === replyingTo.id_comentario) {
                            return {
                                ...c,
                                respostas: [...(c.respostas || []), response.data],
                                respostas_count: (c.respostas_count || 0) + 1
                            };
                        }
                        return c;
                    })
                );
                setReplyingTo(null);
            } else {
                // Add new root comment
                setComments([response.data, ...comments]);
            }
            setNewComment('');
            setError(null);
        } catch (err) {
            console.error('Error creating comment:', err);
            setError('Erro ao enviar comentário');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (commentId) => {
        // Remove from root or from replies
        setComments(prevComments => {
            // Try to remove from root
            const filtered = prevComments.filter(c => c.id_comentario !== commentId);
            if (filtered.length < prevComments.length) return filtered;

            // Try to remove from replies
            return prevComments.map(c => ({
                ...c,
                respostas: (c.respostas || []).filter(r => r.id_comentario !== commentId),
                respostas_count: (c.respostas || []).filter(r => r.id_comentario !== commentId).length
            }));
        });
    };

    const handleUpdate = (commentId, newText) => {
        setComments(prevComments =>
            prevComments.map(c => {
                if (c.id_comentario === commentId) {
                    return { ...c, conteudo_texto: newText, editado: true };
                }
                // Check replies
                if (c.respostas) {
                    return {
                        ...c,
                        respostas: c.respostas.map(r =>
                            r.id_comentario === commentId
                                ? { ...r, conteudo_texto: newText, editado: true }
                                : r
                        )
                    };
                }
                return c;
            })
        );
    };

    const handleReply = (comment) => {
        setReplyingTo(comment);
        setNewComment(`@${comment.usuario?.nome_usuario} `);
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setNewComment('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10"
        >
            {/* Reply indicator */}
            {replyingTo && (
                <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-primary/10 rounded-lg">
                    <FaReply className="text-primary text-sm" />
                    <span className="text-sm text-gray-300">
                        Respondendo a <span className="text-primary">@{replyingTo.usuario?.nome_usuario}</span>
                    </span>
                    <button
                        onClick={cancelReply}
                        className="ml-auto text-gray-400 hover:text-white"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>
            )}

            {/* New Comment Form */}
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={replyingTo ? "Escreva sua resposta..." : "Escreva um comentário..."}
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 transition-colors"
                    disabled={submitting}
                />
                <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="p-2 bg-primary/20 hover:bg-primary/30 rounded-full text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaPaperPlane />
                </button>
            </form>

            {/* Error */}
            {error && (
                <p className="text-red-400 text-sm mb-2">{error}</p>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Comments List */}
            {!loading && comments.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                    Nenhum comentário ainda. Seja o primeiro!
                </p>
            )}

            <AnimatePresence>
                {comments.map((comment) => (
                    <Comment
                        key={comment.id_comentario}
                        comment={comment}
                        dreamId={dreamId}
                        currentUserId={currentUserId}
                        postOwnerId={postOwnerId}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                        onReply={handleReply}
                    />
                ))}
            </AnimatePresence>
        </motion.div>
    );
};

export default CommentSection;
