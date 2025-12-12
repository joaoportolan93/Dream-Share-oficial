import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaEllipsisH, FaEdit, FaTrash, FaUserFriends } from 'react-icons/fa';
import { deleteDream } from '../services/api';

const DreamCard = ({ dream, onDelete, onEdit, currentUserId }) => {
    const [liked, setLiked] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const isOwner = dream.usuario?.id_usuario === currentUserId;

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

    const handleDelete = async () => {
        if (!window.confirm('Tem certeza que deseja excluir este sonho?')) return;
        setDeleting(true);
        try {
            await deleteDream(dream.id_publicacao);
            onDelete?.(dream.id_publicacao);
        } catch (err) {
            console.error('Error deleting dream:', err);
        } finally {
            setDeleting(false);
            setShowMenu(false);
        }
    };

    const tipoSonhoColors = {
        'Lúcido': 'bg-purple-500',
        'Pesadelo': 'bg-red-500',
        'Normal': 'bg-blue-500',
        'Recorrente': 'bg-yellow-500',
    };

    return (
        <div className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition-colors ${dream.visibilidade === 2 ? 'border border-green-500/30' : ''}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Link to={`/user/${dream.usuario?.nome_usuario}`}>
                        <img
                            src={dream.usuario?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                            alt={dream.usuario?.nome_completo}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <Link to={`/user/${dream.usuario?.nome_usuario}`} className="font-semibold text-white hover:text-primary transition-colors">
                                {dream.usuario?.nome_completo}
                            </Link>
                            {dream.visibilidade === 2 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full text-green-400 text-xs font-medium" title="Melhores Amigos">
                                    <FaUserFriends size={10} /> <span>Close Friends</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-400">
                            @{dream.usuario?.nome_usuario} · {formatDate(dream.data_publicacao)}
                        </p>
                    </div>
                </div>

                {/* Menu */}
                {isOwner && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <FaEllipsisH className="text-gray-400" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-10 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-10 min-w-[150px]">
                                <button
                                    onClick={() => { onEdit?.(dream); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-white hover:bg-white/10 transition-colors"
                                >
                                    <FaEdit /> Editar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-white/10 transition-colors"
                                >
                                    <FaTrash /> {deleting ? 'Excluindo...' : 'Excluir'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Type Badge */}
            {dream.tipo_sonho && (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-3 ${tipoSonhoColors[dream.tipo_sonho] || 'bg-gray-500'}`}>
                    {dream.tipo_sonho}
                </span>
            )}

            {/* Title */}
            {dream.titulo && (
                <h3 className="text-xl font-bold text-white mb-2">{dream.titulo}</h3>
            )}

            {/* Content */}
            <p className="text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">
                {dream.conteudo_texto}
            </p>

            {/* Image */}
            {dream.imagem && (
                <div className="mb-4 rounded-xl overflow-hidden">
                    <img src={dream.imagem} alt="Dream visual" className="w-full h-auto max-h-[500px] object-cover" />
                </div>
            )}


            {/* Emotions */}
            {dream.emocoes_sentidas && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {dream.emocoes_sentidas.split(',').map((emocao, index) => (
                        <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                            {emocao.trim()}
                        </span>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                <button
                    onClick={() => setLiked(!liked)}
                    className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                    {liked ? <FaHeart className="text-red-400" /> : <FaRegHeart />}
                    <span className="text-sm">0</span>
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
                    <FaComment />
                    <span className="text-sm">0</span>
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
                    <FaShare />
                </button>
            </div>
        </div>
    );
};

export default DreamCard;
