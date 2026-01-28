import React, { useState } from 'react';
import { FaTimes, FaImage, FaMoon, FaSmile } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ReplyModal = ({ isOpen, onClose, onSubmit, replyingTo, post, currentUser }) => {
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!text.trim() || submitting) return;

        setSubmitting(true);
        try {
            await onSubmit(text.trim(), replyingTo?.id_comentario || null);
            setText('');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const targetUser = replyingTo?.usuario || post?.usuario;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4"
                onClick={onClose}
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
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <FaTimes className="text-white" />
                        </button>
                        <span className="text-primary text-sm font-medium">Rascunhos</span>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {/* Original post/comment preview */}
                        <div className="flex gap-3 pb-4 border-l-2 border-white/20 ml-6 pl-6 mb-4">
                            <img
                                src={targetUser?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                                alt={targetUser?.nome_completo}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0 -ml-[32px]"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-sm">
                                        {targetUser?.nome_completo}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                        @{targetUser?.nome_usuario}
                                    </span>
                                </div>
                                <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                                    {replyingTo?.conteudo_texto || post?.conteudo_texto}
                                </p>
                            </div>
                        </div>

                        {/* Replying to indicator */}
                        <p className="text-gray-400 text-sm mb-3 ml-16">
                            Respondendo a <span className="text-primary">@{targetUser?.nome_usuario}</span>
                        </p>

                        {/* Reply input */}
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
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-4 border-t border-white/10">
                        <div className="flex gap-1 text-primary">
                            {/* Media buttons */}
                            <button className="p-2 rounded-full hover:bg-primary/20 transition-colors" title="Adicionar imagem">
                                <FaImage size={18} />
                            </button>
                            <button className="p-2 rounded-full hover:bg-primary/20 transition-colors" title="Tipo de sonho">
                                <FaMoon size={18} />
                            </button>
                            <button className="p-2 rounded-full hover:bg-primary/20 transition-colors" title="Emojis">
                                <FaSmile size={18} />
                            </button>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!text.trim() || submitting}
                            className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Enviando...' : 'Responder'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReplyModal;
