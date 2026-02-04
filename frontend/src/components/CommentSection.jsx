import React, { useState, useEffect, useRef } from 'react';
import { 
    FaPaperPlane, FaTimes, FaImage, FaVideo, FaSpinner,
    FaFire, FaClock, FaHeart
} from 'react-icons/fa';
import { getComments, createComment } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Comment from './Comment';

// Sorting tabs configuration
const SORT_TABS = [
    { key: 'relevance', label: 'Mais Relevantes', icon: FaFire },
    { key: 'recent', label: 'Mais Recentes', icon: FaClock },
    { key: 'likes', label: 'Mais Curtidos', icon: FaHeart },
];

const CommentSection = ({ 
    dreamId, 
    currentUserId, 
    postOwnerId,
    postOwnerUsername,
    onReportComment 
}) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [sortBy, setSortBy] = useState('recent');
    
    // Media upload state
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    
    const inputRef = useRef(null);
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    useEffect(() => {
        fetchComments();
    }, [dreamId, sortBy]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await getComments(dreamId, sortBy);
            setComments(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching comments:', err);
            setError('Erro ao carregar comentários');
        } finally {
            setLoading(false);
        }
    };

    // Handle image selection
    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Imagem deve ter no máximo 5MB');
                return;
            }
            // Revoke previous URL to prevent memory leak
            if (mediaPreview) {
                URL.revokeObjectURL(mediaPreview);
            }
            setSelectedImage(file);
            setSelectedVideo(null);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    // Handle video selection
    const handleVideoSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                setError('Vídeo deve ter no máximo 50MB');
                return;
            }
            // Revoke previous URL to prevent memory leak
            if (mediaPreview) {
                URL.revokeObjectURL(mediaPreview);
            }
            setSelectedVideo(file);
            setSelectedImage(null);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    // Clear media
    const clearMedia = () => {
        setSelectedImage(null);
        setSelectedVideo(null);
        if (mediaPreview) {
            URL.revokeObjectURL(mediaPreview);
        }
        setMediaPreview(null);
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((!newComment.trim() && !selectedImage && !selectedVideo) || submitting) return;

        setSubmitting(true);
        try {
            const parentId = replyingTo?.id_comentario || null;
            
            // Create FormData for media upload
            const formData = new FormData();
            if (newComment.trim()) {
                formData.append('conteudo_texto', newComment.trim());
            }
            if (parentId) {
                formData.append('comentario_pai', parentId);
            }
            if (selectedImage) {
                formData.append('imagem', selectedImage);
            }
            if (selectedVideo) {
                formData.append('video', selectedVideo);
            }

            const response = await createComment(dreamId, formData);

            if (replyingTo) {
                // Add reply to the parent comment
                setComments(prevComments =>
                    addReplyToComment(prevComments, replyingTo.id_comentario, response.data)
                );
                setReplyingTo(null);
            } else {
                // Add new root comment at the beginning
                setComments(prevComments => [response.data, ...prevComments]);
            }
            
            setNewComment('');
            clearMedia();
            setError(null);
        } catch (err) {
            console.error('Error creating comment:', err);
            setError('Erro ao enviar comentário');
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to add reply to nested comment structure
    const addReplyToComment = (comments, parentId, newReply) => {
        return comments.map(c => {
            if (c.id_comentario === parentId) {
                return {
                    ...c,
                    respostas: [...(c.respostas || []), newReply],
                    respostas_count: (c.respostas_count || 0) + 1
                };
            }
            if (c.respostas && c.respostas.length > 0) {
                return {
                    ...c,
                    respostas: addReplyToComment(c.respostas, parentId, newReply)
                };
            }
            return c;
        });
    };

    // Handle delete (recursive through tree)
    const handleDelete = (commentId) => {
        const removeFromTree = (comments) => {
            return comments
                .filter(c => c.id_comentario !== commentId)
                .map(c => ({
                    ...c,
                    respostas: c.respostas ? removeFromTree(c.respostas) : []
                }));
        };
        setComments(prev => removeFromTree(prev));
    };

    // Handle update (recursive through tree)
    const handleUpdate = (commentId, newText) => {
        const updateInTree = (comments) => {
            return comments.map(c => {
                if (c.id_comentario === commentId) {
                    return { ...c, conteudo_texto: newText, editado: true };
                }
                if (c.respostas) {
                    return { ...c, respostas: updateInTree(c.respostas) };
                }
                return c;
            });
        };
        setComments(prev => updateInTree(prev));
    };

    // Handle reply - scroll to input and focus
    const handleReply = (comment) => {
        setReplyingTo(comment);
        setNewComment(`@${comment.usuario?.nome_usuario} `);
        inputRef.current?.focus();
    };

    // Cancel reply
    const cancelReply = () => {
        setReplyingTo(null);
        setNewComment('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10"
        >
            {/* Sorting Tabs */}
            <div className="flex border-b border-white/10">
                {SORT_TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setSortBy(key)}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all relative
                            ${sortBy === key 
                                ? 'text-white' 
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                            }`}
                    >
                        <Icon size={14} />
                        <span className="hidden sm:inline">{label}</span>
                        {sortBy === key && (
                            <motion.div
                                layoutId="sortIndicator"
                                className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Reply Indicator */}
            <AnimatePresence>
                {replyingTo && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 border-b border-white/10"
                    >
                        <span className="text-sm text-gray-300">
                            Respondendo a{' '}
                            <span className="text-primary font-medium">
                                @{replyingTo.usuario?.nome_usuario}
                            </span>
                        </span>
                        <button
                            onClick={cancelReply}
                            className="ml-auto p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                        >
                            <FaTimes size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New Comment Form */}
            <form onSubmit={handleSubmit} className="p-4 border-b border-white/10">
                <div className="flex gap-3">
                    {/* User Avatar Placeholder */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-purple-500/50 flex-shrink-0" />
                    
                    <div className="flex-1 space-y-3">
                        {/* Text Input */}
                        <textarea
                            ref={inputRef}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={replyingTo ? "Poste sua resposta" : "Adicione um comentário..."}
                            className="w-full bg-transparent text-white text-lg placeholder-gray-500 resize-none focus:outline-none min-h-[60px]"
                            disabled={submitting}
                            rows={2}
                        />

                        {/* Media Preview */}
                        {mediaPreview && (
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 max-w-xs">
                                {selectedImage && (
                                    <img 
                                        src={mediaPreview} 
                                        alt="Preview" 
                                        className="max-h-40 object-cover" 
                                    />
                                )}
                                {selectedVideo && (
                                    <video 
                                        src={mediaPreview} 
                                        className="max-h-40 object-cover" 
                                        controls 
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={clearMedia}
                                    className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                                >
                                    <FaTimes size={12} />
                                </button>
                            </div>
                        )}

                        {/* Actions Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            {/* Media Buttons */}
                            <div className="flex items-center gap-1">
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                                    disabled={submitting}
                                >
                                    <FaImage size={18} />
                                </button>

                                <input
                                    ref={videoInputRef}
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoSelect}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => videoInputRef.current?.click()}
                                    className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                                    disabled={submitting}
                                >
                                    <FaVideo size={18} />
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={(!newComment.trim() && !selectedImage && !selectedVideo) || submitting}
                                className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/80 text-white font-bold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <FaSpinner className="animate-spin" size={14} />
                                ) : (
                                    <FaPaperPlane size={14} />
                                )}
                                <span>{replyingTo ? 'Responder' : 'Postar'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 py-2 bg-red-500/10 border-b border-red-500/20"
                    >
                        <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Empty State */}
            {!loading && comments.length === 0 && (
                <div className="text-center py-12 px-4">
                    <p className="text-gray-400 text-lg mb-2">Nenhum comentário ainda</p>
                    <p className="text-gray-500 text-sm">Seja o primeiro a comentar!</p>
                </div>
            )}

            {/* Comments List */}
            <div className="divide-y divide-white/5">
                <AnimatePresence>
                    {comments.map((comment) => (
                        <Comment
                            key={comment.id_comentario}
                            comment={comment}
                            dreamId={dreamId}
                            currentUserId={currentUserId}
                            postOwnerId={postOwnerId}
                            postOwnerUsername={postOwnerUsername}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                            onReply={handleReply}
                            onReport={onReportComment}
                            depth={0}
                            maxDepth={3}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default CommentSection;
