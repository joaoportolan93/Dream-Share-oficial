import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaEdit, FaEllipsisH, FaBirthdayCake, FaMoon } from 'react-icons/fa';
import { getProfile, getMyDreams } from '../services/api';
import DreamCard from '../components/DreamCard';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('dreams');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dreams, setDreams] = useState([]);
    const [dreamsLoading, setDreamsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, dreamsRes] = await Promise.all([
                    getProfile(),
                    getMyDreams()
                ]);
                setUser(profileRes.data);
                setDreams(dreamsRes.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
                setDreamsLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (dateString, type = 'join') => {
        if (!dateString) return 'Data não informada';
        // Fix timezone offset issue
        const dateValue = dateString.includes('T') ? dateString : `${dateString}T12:00:00`;
        const date = new Date(dateValue);
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

        if (type === 'birth') {
            return `Nascido em ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
        }
        return `Membro desde ${months[date.getMonth()]} de ${date.getFullYear()}`;
    };

    const handleDeleteDream = (dreamId) => {
        setDreams(prev => prev.filter(d => d.id_publicacao !== dreamId));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const avatarUrl = user?.avatar_url || 'https://randomuser.me/api/portraits/women/44.jpg';

    return (
        <div className="min-h-screen">
            {/* Profile Header */}
            <div className="relative bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-xl p-8 mb-6 overflow-hidden text-white max-w-5xl mx-auto">
                {/* Background Image Overlay */}
                <div
                    className="absolute top-0 left-0 right-0 bottom-0 opacity-20 z-0"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80')",
                        backgroundPosition: 'center',
                        backgroundSize: 'cover'
                    }}
                />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-white object-cover"
                    />

                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                        <h1 className="text-3xl font-bold mb-2">
                            {user?.nome_completo || 'Usuário'}
                        </h1>
                        <h2 className="text-lg mb-4 opacity-90">
                            @{user?.nome_usuario || 'username'}
                        </h2>
                        <p className="mb-4 leading-relaxed max-w-2xl">
                            {user?.bio || 'Ainda não há uma bio. Clique em editar perfil para adicionar uma!'}
                        </p>

                        <div className="flex gap-6 flex-wrap mb-4 justify-center md:justify-start">
                            <div className="flex items-center gap-2 text-sm">
                                <FaCalendarAlt className="opacity-90" />
                                <span>{formatDate(user?.data_criacao, 'join')}</span>
                            </div>
                            {user?.data_nascimento && (
                                <div className="flex items-center gap-2 text-sm">
                                    <FaBirthdayCake className="opacity-90" />
                                    <span>{formatDate(user?.data_nascimento, 'birth')}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-8 mb-6 justify-center md:justify-start">
                            <div className="text-center md:text-left">
                                <div className="text-xl font-bold">{dreams.length}</div>
                                <div className="text-sm opacity-90">Sonhos</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-xl font-bold">{user?.seguidores_count || 0}</div>
                                <div className="text-sm opacity-90">Seguidores</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-xl font-bold">{user?.seguindo_count || 0}</div>
                                <div className="text-sm opacity-90">Seguindo</div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Link
                                to="/edit-profile"
                                className="flex items-center gap-2 px-6 py-3 bg-white text-[#764ba2] rounded-full font-semibold transition-transform hover:-translate-y-0.5"
                            >
                                <FaEdit />
                                Editar Perfil
                            </Link>
                            <button className="flex items-center gap-2 px-4 py-3 bg-white/20 backdrop-blur-sm rounded-full transition-transform hover:-translate-y-0.5">
                                <FaEllipsisH />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto px-4">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-white/10 mb-8">
                    <button
                        className={`px-6 py-4 text-base transition-colors ${activeTab === 'dreams'
                            ? 'border-b-4 border-purple-500 text-purple-400 font-semibold'
                            : 'text-gray-500 dark:text-gray-400 hover:text-purple-400'
                            }`}
                        onClick={() => setActiveTab('dreams')}
                    >
                        Sonhos
                    </button>
                    <button
                        className={`px-6 py-4 text-base transition-colors ${activeTab === 'journal'
                            ? 'border-b-4 border-purple-500 text-purple-400 font-semibold'
                            : 'text-gray-500 dark:text-gray-400 hover:text-purple-400'
                            }`}
                        onClick={() => setActiveTab('journal')}
                    >
                        Diário
                    </button>
                    <button
                        className={`px-6 py-4 text-base transition-colors ${activeTab === 'saved'
                            ? 'border-b-4 border-purple-500 text-purple-400 font-semibold'
                            : 'text-gray-500 dark:text-gray-400 hover:text-purple-400'
                            }`}
                        onClick={() => setActiveTab('saved')}
                    >
                        Salvos
                    </button>
                </div>

                {/* Dreams Tab Content */}
                {activeTab === 'dreams' && (
                    <>
                        {dreamsLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : dreams.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {dreams.map(dream => (
                                    <DreamCard
                                        key={dream.id_publicacao}
                                        dream={dream}
                                        currentUserId={user?.id_usuario}
                                        onDelete={handleDeleteDream}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FaMoon className="text-6xl text-gray-500 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                                    Nenhum sonho registrado ainda.
                                </p>
                                <p className="text-gray-400 dark:text-gray-500 mb-6">
                                    Comece a registrar seus sonhos para vê-los aqui!
                                </p>
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-full hover:opacity-90 transition-all"
                                >
                                    Criar meu primeiro sonho
                                </Link>
                            </div>
                        )}
                    </>
                )}

                {/* Journal Tab Content */}
                {activeTab === 'journal' && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                            Seu diário está vazio.
                        </p>
                        <p className="text-gray-400 dark:text-gray-500">
                            Em breve você poderá manter um diário de sonhos privado!
                        </p>
                    </div>
                )}

                {/* Saved Tab Content */}
                {activeTab === 'saved' && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                            Nenhum sonho salvo ainda.
                        </p>
                        <p className="text-gray-400 dark:text-gray-500">
                            Salve sonhos interessantes para encontrá-los facilmente aqui!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
