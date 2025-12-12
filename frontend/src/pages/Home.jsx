import React, { useState, useEffect } from 'react';
import { FaMoon, FaPlus } from 'react-icons/fa';
import DreamCard from '../components/DreamCard';
import CreateDreamModal from '../components/CreateDreamModal';
import { getDreams, getProfile } from '../services/api';

const Home = () => {
    const [dreams, setDreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDream, setEditingDream] = useState(null);

    const fetchDreams = async () => {
        try {
            const response = await getDreams();
            setDreams(response.data);
        } catch (err) {
            console.error('Error fetching dreams:', err);
            setError('Erro ao carregar sonhos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDreams();

        // Get current user ID
        getProfile().then(res => {
            setCurrentUserId(res.data.id_usuario);
        }).catch(console.error);
    }, []);

    const handleDreamCreated = () => {
        fetchDreams();
        setEditingDream(null);
    };

    const handleDeleteDream = (dreamId) => {
        setDreams(prev => prev.filter(d => d.id_publicacao !== dreamId));
    };

    const handleEditDream = (dream) => {
        setEditingDream(dream);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingDream(null);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Feed de Sonhos</h1>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-full hover:opacity-90 transition-all"
                >
                    <FaPlus />
                    Novo Sonho
                </button>
            </div>

            {/* Welcome Card */}
            <div className="w-full bg-gradient-to-r from-secondary via-purple-500 to-orange-400 rounded-2xl p-8 shadow-soft text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-3">Bem-vindo ao DreamShare!</h2>
                    <p className="text-white/90 max-w-[400px] leading-relaxed">
                        Compartilhe seus sonhos, conecte-se com outros sonhadores e explore as múltiplas camadas do mundo onírico.
                    </p>
                </div>
                <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-900/30 text-red-300 rounded-lg">
                    {error}
                </div>
            )}

            {/* Dreams Feed */}
            {dreams.length === 0 ? (
                <div className="text-center py-12">
                    <FaMoon className="text-6xl text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">Nenhum sonho registrado ainda</p>
                    <p className="text-gray-500">Use o botão acima para compartilhar seu primeiro sonho!</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {dreams.map(dream => (
                        <DreamCard
                            key={dream.id_publicacao}
                            dream={dream}
                            currentUserId={currentUserId}
                            onDelete={handleDeleteDream}
                            onEdit={handleEditDream}
                        />
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <CreateDreamModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingDream(null); }}
                onSuccess={handleDreamCreated}
                editingDream={editingDream}
            />
        </div>
    );
};

export default Home;
