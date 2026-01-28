import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaReply, FaEllipsisH, FaEdit, FaTrash, FaTimes, FaCheck } from 'react-icons/fa';
import { deleteComment, editComment, likeComment } from '../services/api';

const CommentItem = ({
    comment,
    dreamId,
    currentUserId,
    postOwnerId,
    onDelete,
    onUpdate,
    onReply,
    formatDate,
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

    const canDelete = comment.can_delete;
    const canEdit = comment.can_edit;

    return (
        <div className={`border-b border-gray-200 dark:border-white/10 ${isReply ? 'ml-12' : ''}`}>
            <div className="p-4 flex gap-3">
                <Link to={`/user/${comment.usuario?.id_usuario}`}>
                    <img
                        src={comment.usuario?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                        alt={comment.usuario?.nome_completo}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                </Link>
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Link
                                to={`/user/${comment.usuario?.id_usuario}`}
                                className="font-bold text-gray-900 dark:text-white hover:underline text-sm"
                            >
                                {comment.usuario?.nome_completo}
                            </Link>
                            <span className="text-gray-500 text-sm">
                                @{comment.usuario?.nome_usuario}
                            </span>
                            <span className="text-gray-500 text-sm">
                                · {formatDate(comment.data_comentario)}
                            </span>
                            {comment.editado && (
                                <span className="text-gray-500 text-xs italic">
                                    · Editado
                                </span>
                            )}
                        </div>

                        {/* Menu */}
                        {(canEdit || canDelete) && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <FaEllipsisH size={14} />
                                </button>

                                {showMenu && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                        <div className="absolute right-0 top-8 z-20 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl py-1 min-w-[120px]">
                                            {canEdit && (
                                                <button
                                                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10"
                                                >
                                                    <FaEdit size={14} /> Editar
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => { handleDelete(); setShowMenu(false); }}
                                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-white/10"
                                                >
                                                    <FaTrash size={14} /> Excluir
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    {isEditing ? (
                        <div className="mt-2">
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-primary/50"
                                rows={3}
                                autoFocus
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={handleEdit}
                                    disabled={isSubmitting || !editText.trim()}
                                    className="flex items-center gap-1 px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-sm rounded-full disabled:opacity-50"
                                >
                                    <FaCheck size={12} /> Salvar
                                </button>
                                <button
                                    onClick={() => { setIsEditing(false); setEditText(comment.conteudo_texto); }}
                                    className="flex items-center gap-1 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 text-sm rounded-full"
                                >
                                    <FaTimes size={12} /> Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-800 dark:text-gray-200 text-sm mt-1">
                            {comment.conteudo_texto}
                        </p>
                    )}

                    {/* Actions */}
                    {!isEditing && (
                        <div className="flex items-center gap-6 mt-3">
                            {/* Reply */}
                            {!isReply && (
                                <button
                                    onClick={() => onReply(comment)}
                                    className="flex items-center gap-1.5 text-gray-500 hover:text-primary text-sm transition-colors"
                                >
                                    <FaReply size={14} />
                                    {comment.respostas_count > 0 && <span>{comment.respostas_count}</span>}
                                </button>
                            )}

                            {/* Like */}
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                            >
                                {isLiked ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
                                {likesCount > 0 && <span>{likesCount}</span>}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Replies */}
            {!isReply && comment.respostas && comment.respostas.length > 0 && (
                <div>
                    {comment.respostas.map(reply => (
                        <CommentItem
                            key={reply.id_comentario}
                            comment={reply}
                            dreamId={dreamId}
                            currentUserId={currentUserId}
                            postOwnerId={postOwnerId}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                            onReply={onReply}
                            formatDate={formatDate}
                            isReply={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
