import React, { useState } from 'react';
import { FaUsers, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CreateCommunityModal from '../components/CreateCommunityModal';

const Communities = () => {
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [communities, setCommunities] = useState([
        {
            id: 'sonhos-lucidos',
            name: 'Sonhos Lúcidos',
            description: 'Compartilhe técnicas e experiências sobre como controlar seus sonhos.',
            members: '15.4k',
            image: 'https://picsum.photos/seed/lucid/100/100'
        },
        {
            id: 'pesadelos',
            name: 'Pesadelos',
            description: 'Um espaço seguro para discutir e entender seus sonhos mais assustadores.',
            members: '8.2k',
            image: 'https://picsum.photos/seed/nightmare/100/100'
        },
        {
            id: 'interpretacao',
            name: 'Interpretação',
            description: 'Busque significados e simbolismos para o que você sonhou.',
            members: '22.1k',
            image: 'https://picsum.photos/seed/meaning/100/100'
        },
        {
            id: 'diario',
            name: 'Diário de Sonhos',
            description: 'Dicas e métodos para manter um registro consistente dos seus sonhos.',
            members: '5.6k',
            image: 'https://picsum.photos/seed/journal/100/100'
        }
    ]);

    const handleCreateCommunity = (newCommunity) => {
        const community = {
            id: newCommunity.name.toLowerCase().replace(/\s+/g, '-'),
            name: newCommunity.name,
            description: newCommunity.description,
            members: '1', // Creator is the first member
            image: newCommunity.image || `https://picsum.photos/seed/${newCommunity.name}/100/100` // Fallback if no image
        };

        setCommunities([community, ...communities]);
    };

    return (
        <div className="flex flex-col gap-6 relative">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-primary">Comunidades</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                >
                    <FaPlus /> Criar Comunidade
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communities.map((community) => (
                    <div key={community.id} className="bg-white dark:bg-[#1a1b1e] rounded-xl p-5 shadow-card hover:shadow-lg transition-all border border-transparent hover:border-primary/20 group">
                        <div className="flex items-start gap-4">
                            <img
                                src={community.image}
                                alt={community.name}
                                className="w-16 h-16 rounded-xl object-cover bg-gray-100 dark:bg-gray-800"
                            />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-text-main dark:text-white mb-1 group-hover:text-primary transition-colors">
                                    {community.name}
                                </h3>
                                <p className="text-text-secondary dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                    {community.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-text-secondary dark:text-gray-500 font-medium">
                                        {community.members} membros
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/community/${community.id}`)}
                                            className="px-4 py-1.5 rounded-full text-sm font-bold bg-primary-light/10 text-primary hover:bg-primary hover:text-white transition-colors"
                                        >
                                            Visitar
                                        </button>
                                        <button className="px-4 py-1.5 rounded-full text-sm font-bold border border-primary text-primary hover:bg-primary-light/10 transition-colors">
                                            Entrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <CreateCommunityModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateCommunity}
            />
        </div>
    );
};

export default Communities;
