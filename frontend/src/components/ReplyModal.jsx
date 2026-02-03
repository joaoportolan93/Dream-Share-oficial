import React, { useState, useRef } from 'react';
import { FaTimes, FaImage, FaVideo, FaSmile, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ReplyModal = ({ isOpen, onClose, onSubmit, replyingTo, post, currentUser }) => {
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    // Media state
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaError, setMediaError] = useState(null);
    
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    // Handle image selection
    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            setMediaError('Imagem deve ter no máximo 5MB');
            return;
        }
        
        // Revogar URL anterior para evitar memory leak
        if (mediaPreview) {
            URL.revokeObjectURL(mediaPreview);
        }
        setSelectedImage(file);
        setSelectedVideo(null);
        setMediaPreview(URL.createObjectURL(file));
        setMediaError(null);
    };

    // Handle video selection
    const handleVideoSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 50 * 1024 * 1024) {
            setMediaError('Vídeo deve ter no máximo 50MB');
            return;
        }
        
        // Revogar URL anterior para evitar memory leak
        if (mediaPreview) {
            URL.revokeObjectURL(mediaPreview);
        }
        setSelectedVideo(file);
        setSelectedImage(null);
        setMediaPreview(URL.createObjectURL(file));
        setMediaError(null);
    };

    // Clear media
    const clearMedia = () => {
        setSelectedImage(null);
        setSelectedVideo(null);
        if (mediaPreview) {
            URL.revokeObjectURL(mediaPreview);
        }
        setMediaPreview(null);
        setMediaError(null);
    };

    // Reset form on close
    const handleClose = () => {
        setText('');
        clearMedia();
        onClose();
    };

    const handleSubmit = async () => {
        if ((!text.trim() && !selectedImage && !selectedVideo) || submitting) return;

        setSubmitting(true);
        try {
            // Create FormData for media support
            const formData = new FormData();
            if (text.trim()) {
                formData.append('conteudo_texto', text.trim());
            }
            if (replyingTo?.id_comentario) {
                formData.append('comentario_pai', replyingTo.id_comentario);
            }
            if (selectedImage) {
                formData.append('imagem', selectedImage);
            }
            if (selectedVideo) {
                formData.append('video', selectedVideo);
            }
            
            await onSubmit(formData, replyingTo?.id_comentario || null);
            setText('');
            clearMedia();
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const targetUser = replyingTo?.usuario || post?.usuario;
    const canSubmit = text.trim() || selectedImage || selectedVideo;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4"
                onClick={handleClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="relative w-full max-w-xl bg-[#1a1a2e] rounded-2xl shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <FaTimes className="text-white" />
                        </button>
                        <span className="text-primary text-sm font-medium">Rascunhos</span>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {/* Original post/comment preview */}
                        <div className="flex gap-3 mb-4">
                            <div className="flex flex-col items-center">
                                <img
                                    src={targetUser?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                                    alt={targetUser?.nome_completo}
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                                {/* Thread line */}
                                <div className="w-0.5 flex-1 bg-white/20 mt-2 rounded-full min-h-[20px]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-sm">
                                        {targetUser?.nome_completo}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                        @{targetUser?.nome_usuario}
                                    </span>
                                </div>
                                <p className="text-gray-300 text-sm mt-1 line-clamp-3">
                                    {replyingTo?.conteudo_texto || post?.conteudo_texto}
                                </p>
                            </div>
                        </div>

                        {/* Replying to indicator */}
                        <p className="text-gray-400 text-sm mb-3 ml-[52px]">
                            Respondendo a <span className="text-primary">@{targetUser?.nome_usuario}</span>
                        </p>

                        {/* Reply input area */}
                        <div className="flex gap-3">
                            <img
                                src={currentUser?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                                alt="You"
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Postar sua resposta"
                                    className="w-full bg-transparent text-white text-lg placeholder-gray-500 resize-none focus:outline-none min-h-[100px]"
                                    autoFocus
                                />

                                {/* Media Preview */}
                                {mediaPreview && (
                                    <div className="relative rounded-2xl overflow-hidden border border-white/10 max-w-xs mt-3">
                                        {selectedImage && (
                                            <img 
                                                src={mediaPreview} 
                                                alt="Preview" 
                                                className="max-h-48 object-cover w-full" 
                                            />
                                        )}
                                        {selectedVideo && (
                                            <video 
                                                src={mediaPreview} 
                                                className="max-h-48 object-cover w-full" 
                                                controls 
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={clearMedia}
                                            className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 rounded-full text-white transition-colors"
                                        >
                                            <FaTimes size={14} />
                                        </button>
                                    </div>
                                )}

                                {/* Media Error */}
                                {mediaError && (
                                    <p className="text-red-400 text-sm mt-2">{mediaError}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-4 border-t border-white/10">
                        <div className="flex gap-1">
                            {/* Image upload */}
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            <button 
                                onClick={() => imageInputRef.current?.click()}
                                className="p-2.5 rounded-full text-primary hover:bg-primary/20 transition-colors" 
                                title="Adicionar imagem"
                                disabled={submitting}
                            >
                                <FaImage size={18} />
                            </button>

                            {/* Video upload */}
                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/*"
                                onChange={handleVideoSelect}
                                className="hidden"
                            />
                            <button 
                                onClick={() => videoInputRef.current?.click()}
                                className="p-2.5 rounded-full text-primary hover:bg-primary/20 transition-colors" 
                                title="Adicionar vídeo"
                                disabled={submitting}
                            >
                                <FaVideo size={18} />
                            </button>

                            {/* Emoji (placeholder) */}
                            <button 
                                className="p-2.5 rounded-full text-primary hover:bg-primary/20 transition-colors" 
                                title="Emojis"
                                disabled={submitting}
                            >
                                <FaSmile size={18} />
                            </button>
                        </div>
                        
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit || submitting}
                            className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting && <FaSpinner className="animate-spin" size={14} />}
                            {submitting ? 'Enviando...' : 'Responder'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReplyModal;
