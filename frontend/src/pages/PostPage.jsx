import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaHeart, FaRegHeart, FaComment, FaShare, FaEllipsisH, FaEdit, FaTrash, FaFlag, FaBookmark, FaRegBookmark, FaUserFriends, FaFire, FaClock } from 'react-icons/fa';
import { getDream, deleteDream, likeDream, saveDream, getComments, createComment, getProfile } from '../services/api';
import ReplyModal from '../components/ReplyModal';
import CommentItem from '../components/CommentItem';
import CommentDetailModal from '../components/CommentDetailModal';
import ReportModal from '../components/ReportModal';

// Sorting tabs configuration
const SORT_TABS = [
    { key: 'relevance', label: 'Mais Relevantes', icon: FaFire },
    { key: 'recent', label: 'Mais Recentes', icon: FaClock },
    { key: 'likes', label: 'Mais Curtidos', icon: FaHeart },
];

const PostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Post states
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [saved, setSaved] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    // Comments
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);

    // Reply modal
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    
    // Sorting
    const [sortBy, setSortBy] = useState('recent');
    
    // Comment report
    const [reportingComment, setReportingComment] = useState(null);
    const [showCommentReportModal, setShowCommentReportModal] = useState(false);
    
    // Comment detail modal (click to expand)
    const [selectedComment, setSelectedComment] = useState(null);
    const [showCommentDetail, setShowCommentDetail] = useState(false);

    useEffect(() => {
        fetchCurrentUser();
        fetchPost();
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchCurrentUser = async () => {
        try {
            const response = await getProfile();
            setUser(response.data);
        } catch (err) {
            console.error('Error fetching current user:', err);
        }
    };

    const fetchPost = async () => {
        setLoading(true);
        try {
            const response = await getDream(id);
            setPost(response.data);
            setLiked(response.data.is_liked || false);
            setLikesCount(response.data.likes_count || 0);
            setSaved(response.data.is_saved || false);
        } catch (err) {
            console.error('Error fetching post:', err);
            setError('Post não encontrado');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (ordering = sortBy) => {
        setCommentsLoading(true);
        try {
            const response = await getComments(id, ordering);
            setComments(response.data);
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setCommentsLoading(false);
        }
    };

    // Re-fetch comments when sort changes
    useEffect(() => {
        if (id) {
            fetchComments(sortBy);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy]);

    const handleLike = async () => {
        const wasLiked = liked;
        const prevCount = likesCount;
        setLiked(!wasLiked);
        setLikesCount(wasLiked ? prevCount - 1 : prevCount + 1);

        try {
            const response = await likeDream(id);
            setLiked(response.data.is_liked);
            setLikesCount(response.data.likes_count);
        } catch (err) {
            setLiked(wasLiked);
            setLikesCount(prevCount);
        }
    };

    const handleSave = async () => {
        const wasSaved = saved;
        setSaved(!wasSaved);

        try {
            const response = await saveDream(id);
            setSaved(response.data.is_saved);
        } catch (err) {
            setSaved(wasSaved);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Tem certeza que deseja excluir este post?')) return;
        try {
            await deleteDream(id);
            navigate(-1);
        } catch (err) {
            console.error('Error deleting post:', err);
        }
    };

    const handleReply = (comment = null) => {
        setReplyingTo(comment);
        setShowReplyModal(true);
    };

    const handleReplySubmit = async (formData, parentId) => {
        try {
            // formData is now a FormData object from ReplyModal
            const response = await createComment(id, formData);

            if (parentId) {
                // Add reply to parent comment (recursive search)
                const addReplyToTree = (comments) => {
                    return comments.map(c => {
                        if (c.id_comentario === parentId) {
                            return {
                                ...c,
                                respostas: [...(c.respostas || []), response.data],
                                respostas_count: (c.respostas_count || 0) + 1
                            };
                        }
                        if (c.respostas && c.respostas.length > 0) {
                            return {
                                ...c,
                                respostas: addReplyToTree(c.respostas)
                            };
                        }
                        return c;
                    });
                };
                setComments(addReplyToTree(comments));
            } else {
                // Add new root comment
                setComments([response.data, ...comments]);
            }
            setShowReplyModal(false);
            setReplyingTo(null);
        } catch (err) {
            console.error('Error creating comment:', err);
        }
    };

    // Handle report comment
    const handleReportComment = (comment) => {
        setReportingComment(comment);
        setShowCommentReportModal(true);
    };

    // Handle click on comment to expand (like clicking a tweet)
    const handleCommentClick = (comment) => {
        setSelectedComment(comment);
        setShowCommentDetail(true);
    };

    const handleDeleteComment = (commentId) => {
        setComments(prevComments => {
            const filtered = prevComments.filter(c => c.id_comentario !== commentId);
            if (filtered.length < prevComments.length) return filtered;

            return prevComments.map(c => ({
                ...c,
                respostas: (c.respostas || []).filter(r => r.id_comentario !== commentId)
            }));
        });
    };

    const handleUpdateComment = (commentId, newText) => {
        setComments(prevComments =>
            prevComments.map(c => {
                if (c.id_comentario === commentId) {
                    return { ...c, conteudo_texto: newText, editado: true };
                }
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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatRelativeDate = (dateString) => {
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

    const isOwner = post?.usuario?.id_usuario === user?.id_usuario;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0f0d1a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0f0d1a] flex flex-col items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">{error || 'Post não encontrado'}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="text-primary hover:underline"
                >
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-cosmic-bg transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-cosmic-bg/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <FaArrowLeft className="text-gray-800 dark:text-white" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Post</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto">
                {/* Post */}
                <div className="bg-white dark:bg-white/5 border-b border-gray-200 dark:border-white/5 p-6 backdrop-blur-sm rounded-2xl my-4">
                    {/* User Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Link to={`/user/${post.usuario?.id_usuario}`}>
                                <img
                                    src={post.usuario?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                                    alt={post.usuario?.nome_completo}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            </Link>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        to={`/user/${post.usuario?.id_usuario}`}
                                        className="font-bold text-gray-900 dark:text-white hover:underline"
                                    >
                                        {post.usuario?.nome_completo}
                                    </Link>
                                    {post.visibilidade === 2 && (
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full text-green-400 text-xs">
                                            <FaUserFriends size={10} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    @{post.usuario?.nome_usuario}
                                </p>
                            </div>
                        </div>

                        {/* Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <FaEllipsisH className="text-gray-500" />
                            </button>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                    <div className="absolute right-0 top-10 z-20 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl min-w-[150px]">
                                        {isOwner ? (
                                            <>
                                                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10">
                                                    <FaEdit /> Editar
                                                </button>
                                                <button
                                                    onClick={handleDelete}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <FaTrash /> Excluir
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => { setShowReportModal(true); setShowMenu(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                            >
                                                <FaFlag /> Denunciar
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    {post.titulo && (
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            {post.titulo}
                        </h2>
                    )}

                    {/* Content */}
                    <p className="text-gray-900 dark:text-gray-100 text-lg leading-relaxed whitespace-pre-wrap mb-4">
                        {post.conteudo_texto}
                    </p>

                    {/* Image */}
                    {post.imagem && (
                        <div className="mb-4 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
                            <img src={post.imagem} alt="Post visual" className="w-full h-auto" />
                        </div>
                    )}

                    {/* Emotions */}
                    {post.emocoes_sentidas && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.emocoes_sentidas.split(',').map((emocao, index) => (
                                <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-sm text-gray-600 dark:text-gray-300">
                                    {emocao.trim()}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        {formatDate(post.data_publicacao)} · <span className="text-primary">{post.views_count || 0} Visualizações</span>
                    </p>

                    {/* Stats Bar */}
                    <div className="py-3 border-t border-b border-gray-200 dark:border-white/10 mb-3">
                        <div className="flex gap-6">
                            <span className="text-gray-900 dark:text-white">
                                <strong>{likesCount}</strong> <span className="text-gray-500">Curtidas</span>
                            </span>
                            <span className="text-gray-900 dark:text-white">
                                <strong>{comments.length}</strong> <span className="text-gray-500">Comentários</span>
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-around py-2">
                        <button
                            onClick={() => handleReply(null)}
                            className="flex items-center gap-2 p-2 text-gray-500 hover:text-primary transition-colors"
                        >
                            <FaComment size={20} />
                        </button>
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 p-2 transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                        >
                            {liked ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                        </button>
                        <button className="flex items-center gap-2 p-2 text-gray-500 hover:text-primary transition-colors">
                            <FaShare size={20} />
                        </button>
                        <button
                            onClick={handleSave}
                            className={`flex items-center gap-2 p-2 transition-colors ${saved ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
                        >
                            {saved ? <FaBookmark size={20} /> : <FaRegBookmark size={20} />}
                        </button>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-white dark:bg-transparent">
                    {/* Sorting Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-white/10">
                        {SORT_TABS.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setSortBy(key)}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all relative
                                    ${sortBy === key 
                                        ? 'text-gray-900 dark:text-white' 
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <Icon size={14} />
                                <span className="hidden sm:inline">{label}</span>
                                {sortBy === key && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {commentsLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">Nenhum comentário ainda</p>
                            <button
                                onClick={() => handleReply(null)}
                                className="mt-2 text-primary hover:underline"
                            >
                                Seja o primeiro a comentar
                            </button>
                        </div>
                    ) : (
                        <div>
                            {comments.map(comment => (
                                <CommentItem
                                    key={comment.id_comentario}
                                    comment={comment}
                                    dreamId={id}
                                    currentUserId={user?.id_usuario}
                                    postOwnerId={post.usuario?.id_usuario}
                                    postOwnerUsername={post.usuario?.nome_usuario}
                                    onDelete={handleDeleteComment}
                                    onUpdate={handleUpdateComment}
                                    onReply={handleReply}
                                    onReport={handleReportComment}
                                    onClick={handleCommentClick}
                                    formatDate={formatRelativeDate}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Reply Modal */}
            <ReplyModal
                isOpen={showReplyModal}
                onClose={() => { setShowReplyModal(false); setReplyingTo(null); }}
                onSubmit={handleReplySubmit}
                replyingTo={replyingTo}
                post={post}
                currentUser={user}
            />

            {/* Report Post Modal */}
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                contentId={post.id_publicacao}
                contentType={1}
            />

            {/* Report Comment Modal */}
            <ReportModal
                isOpen={showCommentReportModal}
                onClose={() => { setShowCommentReportModal(false); setReportingComment(null); }}
                contentId={reportingComment?.id_comentario}
                contentType={2}
            />

            {/* Comment Detail Modal - shows comment like a post */}
            <CommentDetailModal
                isOpen={showCommentDetail}
                onClose={() => { setShowCommentDetail(false); setSelectedComment(null); }}
                comment={selectedComment}
                dreamId={id}
                currentUserId={user?.id_usuario}
                postOwnerId={post?.usuario?.id_usuario}
                onDelete={handleDeleteComment}
                onUpdate={handleUpdateComment}
                onReply={handleReply}
                onReport={handleReportComment}
                formatDate={formatRelativeDate}
            />
        </div>
    );
};

export default PostPage;
