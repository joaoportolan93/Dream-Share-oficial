/**
 * ReportModal.jsx - Report System
 * Glassmorphism modal for reporting content (posts, comments, users)
 */
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import api from '../services/api';

const REASONS = [
    { value: 1, label: 'Conteúdo Inadequado', description: 'Conteúdo impróprio, violento ou sexual' },
    { value: 2, label: 'Assédio / Discurso de Ódio', description: 'Bullying, ameaças ou discriminação' },
    { value: 3, label: 'Spam / Enganoso', description: 'Propaganda, links suspeitos ou informação falsa' },
];

const ReportModal = ({ isOpen, onClose, contentId, contentType }) => {
    const [selectedReason, setSelectedReason] = useState(null);
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!selectedReason) {
            setError('Selecione um motivo para a denúncia');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await api.post('/api/denuncias/', {
                id_conteudo: contentId,
                tipo_conteudo: contentType,
                motivo_denuncia: selectedReason,
                descricao_denuncia: description || null,
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setSelectedReason(null);
                setDescription('');
            }, 1500);
        } catch (err) {
            console.error('Error submitting report:', err);
            setError('Erro ao enviar denúncia. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const getContentTypeName = () => {
        switch (contentType) {
            case 1: return 'publicação';
            case 2: return 'comentário';
            case 3: return 'usuário';
            default: return 'conteúdo';
        }
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
            <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-red-500/20 rounded-2xl w-full max-w-md shadow-2xl shadow-red-500/10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-red-500/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <FaExclamationTriangle className="text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Denunciar Conteúdo</h2>
                            <p className="text-sm text-gray-400">Reportar esta {getContentTypeName()}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Denúncia Enviada</h3>
                            <p className="text-gray-400">Obrigado por ajudar a manter nossa comunidade segura.</p>
                        </div>
                    ) : (
                        <>
                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Reason Selection */}
                            <div className="space-y-3 mb-6">
                                <label className="text-sm font-medium text-gray-300">Qual o motivo da denúncia?</label>
                                {REASONS.map((reason) => (
                                    <label
                                        key={reason.value}
                                        className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${selectedReason === reason.value
                                            ? 'bg-red-500/20 border-2 border-red-500'
                                            : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={reason.value}
                                            checked={selectedReason === reason.value}
                                            onChange={() => setSelectedReason(reason.value)}
                                            className="mt-1 accent-red-500"
                                        />
                                        <div>
                                            <p className="font-medium text-white">{reason.label}</p>
                                            <p className="text-sm text-gray-400">{reason.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <label className="text-sm font-medium text-gray-300 block mb-2">
                                    Detalhes adicionais (opcional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Descreva mais detalhes sobre o problema..."
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!success && (
                    <div className="flex gap-3 p-6 pt-0">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !selectedReason}
                            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Enviando...' : 'Enviar Denúncia'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default ReportModal;
