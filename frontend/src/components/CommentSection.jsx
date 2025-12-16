import React, { useState, useEffect } from 'react';
import { FaTrash, FaPaperPlane } from 'react-icons/fa';
import { getComments, createComment, deleteComment } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const CommentSection = ({ dreamId, currentUserId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

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
            const response = await createComment(dreamId, newComment.trim());
            setComments([response.data, ...comments]);
            setNewComment('');
            setError(null);
        } catch (err) {
            console.error('Error creating comment:', err);
            setError('Erro ao enviar comentário');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Excluir este comentário?')) return;

        try {
            await deleteComment(dreamId, commentId);
            setComments(comments.filter(c => c.id_comentario !== commentId));
        } catch (err) {
            console.error('Error deleting comment:', err);
            setError('Erro ao excluir comentário');
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

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10"
        >
            {/* New Comment Form */}
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escreva um comentário..."
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
                    <motion.div
                        key={comment.id_comentario}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-3 py-3 border-b border-white/5 last:border-0"
                    >
                        <img
                            src={comment.usuario?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                            alt={comment.usuario?.nome_completo}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-white text-sm">
                                    {comment.usuario?.nome_completo}
                                </span>
                                <span className="text-gray-400 text-xs">
                                    @{comment.usuario?.nome_usuario}
                                </span>
                                <span className="text-gray-500 text-xs">
                                    · {formatDate(comment.data_comentario)}
                                </span>
                            </div>
                            <p className="text-gray-300 text-sm mt-1 break-words">
                                {comment.conteudo_texto}
                            </p>
                        </div>
                        {comment.usuario?.id_usuario === currentUserId && (
                            <button
                                onClick={() => handleDelete(comment.id_comentario)}
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                                title="Excluir comentário"
                            >
                                <FaTrash size={12} />
                            </button>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
};

export default CommentSection;
