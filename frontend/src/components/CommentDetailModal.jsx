import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaArrowLeft, FaHeart, FaRegHeart, FaRegComment, 
    FaRegBookmark, FaShare, FaEllipsisH,
    FaEdit, FaTrash, FaFlag, FaBan, FaVolumeMute
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { likeComment, deleteComment } from '../services/api';
import { ChildBranch, ParentLine } from './ThreadConnectorSVG';

const CommentDetailModal = ({ 
    isOpen, 
    onClose, 
    comment, 
    dreamId, 
    currentUserId, 
    postOwnerId,
    onDelete,
    onUpdate,
    onReply,
    onReport,
    formatDate
}) => {
    const [isLiked, setIsLiked] = useState(comment?.is_liked || false);
    const [likesCount, setLikesCount] = useState(comment?.likes_count || 0);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        if (comment) {
            setIsLiked(comment.is_liked || false);
            setLikesCount(comment.likes_count || 0);
        }
    }, [comment]);

    if (!isOpen || !comment) return null;

    const isOwner = comment.usuario?.id_usuario === currentUserId;
    const hasReplies = comment.respostas && comment.respostas.length > 0;

    const handleLike = async () => {
        try {
            const response = await likeComment(dreamId, comment.id_comentario);
            setIsLiked(response.data.is_liked);
            setLikesCount(response.data.likes_count);
        } catch (err) {
            console.error('Error liking comment:', err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Excluir este comentário?')) return;
        try {
            await deleteComment(dreamId, comment.id_comentario);
            onDelete(comment.id_comentario);
            onClose();
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    // Recursive component to render replies
    const ReplyItem = ({ reply, depth = 0, isLast = false }) => {
        const [replyLiked, setReplyLiked] = useState(reply.is_liked || false);
        const [replyLikesCount, setReplyLikesCount] = useState(reply.likes_count || 0);
        const replyHasReplies = reply.respostas && reply.respostas.length > 0;

        const handleReplyLike = async () => {
            try {
                const response = await likeComment(dreamId, reply.id_comentario);
                setReplyLiked(response.data.is_liked);
                setReplyLikesCount(response.data.likes_count);
            } catch (err) {
                console.error('Error liking reply:', err);
            }
        };

        return (
            <div
                className="border-b border-gray-200 dark:border-white/5 relative"
                style={{ marginLeft: depth > 0 ? '9px' : 0 }}
            >
                {/* SVG L-CONNECTOR for nested replies */}
                {depth > 0 && (
                    <ChildBranch isLast={isLast} indent={10} />
                )}
                <div className="flex gap-3 p-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors relative">
                    <div className="flex flex-col items-center flex-shrink-0">
                        <Link to={`/user/${reply.usuario?.id_usuario}`}>
                            <img
                                src={reply.usuario?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                                alt={reply.usuario?.nome_completo}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        </Link>
                        {/* SVG Parent-to-children line */}
                        {replyHasReplies && (
                            <ParentLine commentId={reply.id_comentario} startY={40} />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* "Em resposta a" context */}
                        {reply.replying_to && (
                            <span className="text-gray-500 text-xs mb-1 block">
                                Em resposta a{' '}
                                <span className="text-primary">@{reply.replying_to.comment_author?.nome_usuario}</span>
                            </span>
                        )}

                        {/* Header */}
                        <div className="flex items-center gap-1 flex-wrap">
                            <Link
                                to={`/user/${reply.usuario?.id_usuario}`}
                                className="font-bold text-gray-900 dark:text-white hover:underline text-sm"
                            >
                                {reply.usuario?.nome_completo}
                            </Link>
                            <span className="text-gray-500 dark:text-gray-500 text-sm">@{reply.usuario?.nome_usuario}</span>
                            <span className="text-gray-500 dark:text-gray-500 text-sm">·</span>
                            <span className="text-gray-500 dark:text-gray-500 text-sm">{formatDate(reply.data_comentario)}</span>
                        </div>

                        {/* Text */}
                        <p className="text-gray-900 dark:text-gray-100 text-[15px] mt-1 break-words whitespace-pre-wrap">
                            {reply.conteudo_texto}
                        </p>

                        {/* Media */}
                        {(reply.imagem_url || reply.video_url) && (
                            <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 max-w-lg">
                                {reply.imagem_url && (
                                    <img
                                        src={reply.imagem_url}
                                        alt="Anexo"
                                        className="max-w-full max-h-80 object-cover"
                                    />
                                )}
                                {reply.video_url && (
                                    <video
                                        src={reply.video_url}
                                        className="max-w-full max-h-80"
                                        controls
                                    />
                                )}
                            </div>
                        )}

                        {/* Action bar - same style as posts */}
                        <div className="flex items-center gap-6 mt-3">
                            {/* Like */}
                            <button
                                onClick={handleReplyLike}
                                className={`flex items-center gap-2 transition-colors ${
                                    replyLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                }`}
                            >
                                {replyLiked ? <FaHeart /> : <FaRegHeart />}
                                {replyLikesCount > 0 && <span className="text-sm font-medium">{replyLikesCount}</span>}
                            </button>

                            {/* Reply */}
                            <button
                                onClick={() => onReply(reply)}
                                className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
                            >
                                <FaRegComment />
                                {reply.respostas_count > 0 && <span className="text-sm font-medium">{reply.respostas_count}</span>}
                            </button>

                            {/* Share */}
                            <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors">
                                <FaShare />
                            </button>

                            {/* Bookmark */}
                            <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors ml-auto">
                                <FaRegBookmark />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Nested replies */}
                {replyHasReplies && depth < 5 && (
                    <div className="pl-[52px]">
                        {reply.respostas.map((nestedReply, idx) => (
                            <ReplyItem 
                                key={nestedReply.id_comentario} 
                                reply={nestedReply} 
                                depth={depth + 1}
                                isLast={idx === reply.respostas.length - 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-xl my-8 mx-4 bg-white dark:bg-[#16213e] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-white/10 sticky top-0 bg-white dark:bg-[#16213e] z-10">
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                            <FaArrowLeft className="text-gray-900 dark:text-white" />
                        </button>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Comentário</h2>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Main comment - displayed like a post */}
                        <div className="p-4 border-b border-gray-200 dark:border-white/10">
                            {/* User info */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <Link to={`/user/${comment.usuario?.id_usuario}`}>
                                        <img
                                            src={comment.usuario?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                                            alt={comment.usuario?.nome_completo}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    </Link>
                                    <div>
                                        <Link
                                            to={`/user/${comment.usuario?.id_usuario}`}
                                            className="font-bold text-gray-900 dark:text-white hover:underline"
                                        >
                                            {comment.usuario?.nome_completo}
                                        </Link>
                                        <p className="text-gray-500 dark:text-gray-500 text-sm">@{comment.usuario?.nome_usuario}</p>
                                    </div>
                                </div>

                                {/* Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <FaEllipsisH size={16} />
                                    </button>
                                    {showMenu && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                            <div className="absolute right-0 top-10 z-50 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl py-1 min-w-[160px]">
                                                {isOwner && (
                                                    <>
                                                        <button 
                                                            onClick={() => { setShowMenu(false); }}
                                                            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
                                                        >
                                                            <FaEdit size={14} /> Editar
                                                        </button>
                                                        <button
                                                            onClick={() => { handleDelete(); setShowMenu(false); }}
                                                            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-white/5"
                                                        >
                                                            <FaTrash size={14} /> Excluir
                                                        </button>
                                                    </>
                                                )}
                                                {!isOwner && (
                                                    <>
                                                        <button
                                                            onClick={() => { onReport && onReport(comment); setShowMenu(false); }}
                                                            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
                                                        >
                                                            <FaFlag size={14} /> Denunciar
                                                        </button>
                                                        <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5">
                                                            <FaBan size={14} /> Bloquear
                                                        </button>
                                                        <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5">
                                                            <FaVolumeMute size={14} /> Silenciar
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* "Em resposta a" context for main comment */}
                            {comment.replying_to && (
                                <p className="text-gray-500 text-sm mb-2">
                                    Em resposta a{' '}
                                    <span className="text-primary">@{comment.replying_to.comment_author?.nome_usuario}</span>
                                </p>
                            )}

                            {/* Comment text - larger like a post */}
                            <p className="text-gray-900 dark:text-white text-xl leading-relaxed whitespace-pre-wrap mb-4">
                                {comment.conteudo_texto}
                            </p>

                            {/* Media */}
                            {(comment.imagem_url || comment.video_url) && (
                                <div className="mb-4 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
                                    {comment.imagem_url && (
                                        <img
                                            src={comment.imagem_url}
                                            alt="Anexo"
                                            className="max-w-full object-cover"
                                        />
                                    )}
                                    {comment.video_url && (
                                        <video
                                            src={comment.video_url}
                                            className="max-w-full"
                                            controls
                                        />
                                    )}
                                </div>
                            )}

                            {/* Timestamp */}
                            <p className="text-gray-500 text-sm mb-4">
                                {formatDate(comment.data_comentario)}
                            </p>

                            {/* Stats bar */}
                            <div className="py-3 border-t border-b border-gray-200 dark:border-white/10 mb-3">
                                <div className="flex gap-6">
                                    <span className="text-gray-900 dark:text-white">
                                        <strong>{likesCount}</strong> <span className="text-gray-500">Curtidas</span>
                                    </span>
                                    <span className="text-gray-900 dark:text-white">
                                        <strong>{comment.respostas_count || 0}</strong> <span className="text-gray-500">Respostas</span>
                                    </span>
                                </div>
                            </div>

                            {/* Action bar - same style as posts */}
                            <div className="flex items-center gap-6 py-2">
                                {/* Like */}
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 transition-colors ${
                                        isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                    }`}
                                >
                                    {isLiked ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
                                </button>

                                {/* Reply */}
                                <button
                                    onClick={() => onReply(comment)}
                                    className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
                                >
                                    <FaRegComment size={18} />
                                </button>

                                {/* Share */}
                                <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors">
                                    <FaShare size={18} />
                                </button>

                                {/* Bookmark */}
                                <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors ml-auto">
                                    <FaRegBookmark size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Replies section */}
                        {hasReplies && (
                            <div>
                                {comment.respostas.map(reply => (
                                    <ReplyItem key={reply.id_comentario} reply={reply} depth={0} />
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {!hasReplies && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Nenhuma resposta ainda</p>
                                <button
                                    onClick={() => onReply(comment)}
                                    className="mt-2 text-primary hover:underline"
                                >
                                    Seja o primeiro a responder
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CommentDetailModal;
