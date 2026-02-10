import React, { useState, useEffect } from 'react';
import { FaMoon, FaPlus, FaUserFriends, FaFire } from 'react-icons/fa';
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
    const [activeTab, setActiveTab] = useState('following');

    const fetchDreams = async (tab = activeTab) => {
        setLoading(true);
        setError('');
        try {
            const response = await getDreams(tab);
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

    // Fetch dreams when tab changes
    useEffect(() => {
        fetchDreams(activeTab);
    }, [activeTab]);

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

    const handleTabChange = (tab) => {
        if (tab !== activeTab) {
            setActiveTab(tab);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feed dos Sonhos</h1>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-full hover:opacity-90 transition-all"
                >
                    <FaPlus />
                    Novo Sonho
                </button>
            </div>

            {/* Feed Tabs */}
            <div className="flex border-b border-gray-200 dark:border-white/10">
                <button
                    onClick={() => handleTabChange('following')}
                    className={`flex items-center gap-2 px-6 py-4 text-base font-medium transition-all relative ${activeTab === 'following'
                        ? 'text-purple-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                >
                    <FaUserFriends className={activeTab === 'following' ? 'text-purple-400' : ''} />
                    Seguindo
                    {activeTab === 'following' && (
                        <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => handleTabChange('foryou')}
                    className={`flex items-center gap-2 px-6 py-4 text-base font-medium transition-all relative ${activeTab === 'foryou'
                        ? 'text-orange-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                >
                    <FaFire className={activeTab === 'foryou' ? 'text-orange-400' : ''} />
                    Para você
                    {activeTab === 'foryou' && (
                        <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="p-4 bg-red-900/30 text-red-300 rounded-lg">
                    {error}
                </div>
            )}

            {/* Dreams Feed */}
            {!loading && !error && dreams.length === 0 ? (
                <div className="text-center py-12">
                    <FaMoon className="text-6xl text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                        {activeTab === 'following'
                            ? 'Nenhum sonho de quem você segue ainda'
                            : 'Nenhum sonho em alta no momento'
                        }
                    </p>
                    <p className="text-gray-400 dark:text-gray-500">
                        {activeTab === 'following'
                            ? 'Siga outros sonhadores para ver seus sonhos aqui!'
                            : 'Volte mais tarde para ver os sonhos mais populares.'
                        }
                    </p>
                </div>
            ) : !loading && !error && (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-white/10">
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
