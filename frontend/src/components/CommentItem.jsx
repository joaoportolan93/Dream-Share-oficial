import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaHeart, FaRegHeart, FaRegComment, FaBookmark, FaRegBookmark,
    FaShare, FaEllipsisH, FaEdit, FaTrash, FaTimes, FaCheck,
    FaFlag, FaBan, FaVolumeMute
} from 'react-icons/fa';
import { deleteComment, editComment, likeComment } from '../services/api';

const CommentItem = ({
    comment,
    dreamId,
    currentUserId,
    postOwnerId,
    onDelete,
    onUpdate,
    onReply,
    onReport,
    onClick,
    formatDate,
    isReply = false,
    depth = 0
}) => {
    const [isLiked, setIsLiked] = useState(comment.is_liked || false);
    const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.conteudo_texto || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const isOwner = comment.usuario?.id_usuario === currentUserId;
    const canDelete = comment.can_delete;
    const canEdit = comment.can_edit;
    const hasReplies = comment.respostas && comment.respostas.length > 0;

    // Build "Em resposta a" text
    const getReplyingToText = () => {
        if (!comment.replying_to) return null;
        
        const commentAuthor = comment.replying_to.comment_author?.nome_usuario;
        const postOwner = comment.replying_to.post_owner?.nome_usuario;
        
        if (postOwner && commentAuthor !== postOwner) {
            return (
                <span className="text-gray-500 text-xs mb-1 block">
                    Em resposta a{' '}
                    <Link to={`/user/${comment.replying_to.comment_author?.id}`} className="text-primary hover:underline">
                        @{commentAuthor}
                    </Link>
                    {' e '}
                    <Link to={`/user/${comment.replying_to.post_owner?.id}`} className="text-primary hover:underline">
                        @{postOwner}
                    </Link>
                </span>
            );
        }
        
        if (commentAuthor) {
            return (
                <span className="text-gray-500 text-xs mb-1 block">
                    Em resposta a{' '}
                    <Link to={`/user/${comment.replying_to.comment_author?.id}`} className="text-primary hover:underline">
                        @{commentAuthor}
                    </Link>
                </span>
            );
        }
        
        return null;
    };

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

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(
                `${window.location.origin}/post/${dreamId}#comment-${comment.id_comentario}`
            );
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    return (
        <article 
            className="border-b border-gray-200 dark:border-white/5 hover:bg-white/[0.02] transition-colors"
            id={`comment-${comment.id_comentario}`}
        >
            <div className="flex gap-3 p-4">
                {/* Avatar column */}
                <div className="flex-shrink-0">
                    <Link to={`/user/${comment.usuario?.id_usuario}`}>
                        <img
                            src={comment.usuario?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                            alt={comment.usuario?.nome_completo}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    </Link>
                </div>

                {/* Content column */}
                <div className="flex-1 min-w-0">
                    {/* "Em resposta a" label */}
                    {getReplyingToText()}

                    {/* Header: Name, Handle, Time, Menu */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 flex-wrap min-w-0">
                            <Link
                                to={`/user/${comment.usuario?.id_usuario}`}
                                className="font-bold text-gray-900 dark:text-white hover:underline text-sm truncate"
                            >
                                {comment.usuario?.nome_completo}
                            </Link>
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
                                    <div className="absolute right-0 top-8 z-50 bg-white dark:bg-[#16213e] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl py-1 min-w-[180px] overflow-hidden">
                                        {canEdit && (
                                            <button
                                                onClick={() => { setIsEditing(true); setShowMenu(false); }}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                            >
                                                <FaEdit size={14} /> Editar
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                onClick={() => { handleDelete(); setShowMenu(false); }}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                            >
                                                <FaTrash size={14} /> Excluir
                                            </button>
                                        )}
                                        {!isOwner && (
                                            <>
                                                <hr className="border-gray-200 dark:border-white/10 my-1" />
                                                <button
                                                    onClick={() => { onReport && onReport(comment); setShowMenu(false); }}
                                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <FaFlag size={14} /> Denunciar
                                                </button>
                                                <button
                                                    onClick={() => setShowMenu(false)}
                                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <FaBan size={14} /> Bloquear @{comment.usuario?.nome_usuario}
                                                </button>
                                                <button
                                                    onClick={() => setShowMenu(false)}
                                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
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

                    {/* Content */}
                    {isEditing ? (
                        <div className="mt-2">
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/20 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:border-primary/50 transition-colors"
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
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 text-sm rounded-full transition-colors"
                                >
                                    <FaTimes size={12} /> Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Text content - clickable to expand */}
                            {comment.conteudo_texto && (
                                <p 
                                    onClick={() => onClick && onClick(comment)}
                                    className="text-gray-900 dark:text-gray-100 text-[15px] mt-1 break-words whitespace-pre-wrap leading-relaxed cursor-pointer hover:text-gray-700 dark:hover:text-white transition-colors"
                                >
                                    {comment.conteudo_texto}
                                </p>
                            )}

                            {/* Media content */}
                            {(comment.imagem_url || comment.video_url) && (
                                <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 max-w-lg">
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
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Action Bar - Same style as posts */}
                    {!isEditing && (
                        <div className="flex items-center gap-6 mt-3">
                            {/* Like */}
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 transition-colors ${
                                    isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                                }`}
                            >
                                {isLiked ? <FaHeart /> : <FaRegHeart />}
                                {likesCount > 0 && <span className="text-sm font-medium">{likesCount}</span>}
                            </button>

                            {/* Reply */}
                            <button
                                onClick={() => onReply(comment)}
                                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                            >
                                <FaRegComment />
                                {comment.respostas_count > 0 && <span className="text-sm font-medium">{comment.respostas_count}</span>}
                            </button>

                            {/* Share */}
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                            >
                                <FaShare />
                            </button>

                            {/* Bookmark */}
                            <button
                                onClick={() => setIsSaved(!isSaved)}
                                className={`flex items-center gap-2 transition-colors ml-auto ${
                                    isSaved ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary'
                                }`}
                                title={isSaved ? "Remover dos salvos" : "Salvar"}
                            >
                                {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Replies */}
            {hasReplies && !isReply && depth < 3 && (
                <div className="pl-[52px]">
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
                            onReport={onReport}
                            onClick={onClick}
                            formatDate={formatDate}
                            isReply={true}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </article>
    );
};

export default CommentItem;
