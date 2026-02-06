import React, { useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import ReplyComposer from './ReplyComposer';

const ReplyModal = ({ isOpen, onClose, onSubmit, replyingTo, post, currentUser }) => {

    // We don't need independent state here anymore, as it's handled by ReplyComposer

    if (!isOpen) return null;

    const targetUser = replyingTo?.usuario || post?.usuario;

    const performSubmit = async (formData) => {
        // Pass to parent onSubmit
        // Need to ensure parentId is sent. The composer only sends formData.
        // We'll wrap it.
        await onSubmit(formData, replyingTo?.id_comentario || null);
        onClose();
    };

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
                    className="relative w-full max-w-xl bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                            <FaTimes className="text-gray-900 dark:text-white" />
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
                                <div className="w-0.5 flex-1 bg-gray-200 dark:bg-white/20 mt-2 rounded-full min-h-[20px]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                                        {targetUser?.nome_completo}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                                        @{targetUser?.nome_usuario}
                                    </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 line-clamp-3">
                                    {replyingTo?.conteudo_texto || post?.conteudo_texto}
                                </p>
                            </div>
                        </div>

                        {/* Replying to indicator */}
                        <p className="text-gray-500 text-sm mb-3 ml-[52px]">
                            Respondendo a <span className="text-primary">@{targetUser?.nome_usuario}</span>
                        </p>

                        {/* Reply Composer */}
                        <ReplyComposer
                            mode="modal"
                            placeholder="Postar sua resposta"
                            currentUser={currentUser}
                            onSubmit={performSubmit}
                            autoFocus={true}
                        />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReplyModal;

