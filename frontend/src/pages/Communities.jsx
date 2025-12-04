import React from 'react';
import { FaUsers, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Communities = () => {
    const navigate = useNavigate();

    const communities = [
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
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-primary">Comunidades</h1>
                <button className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-primary-dark transition-colors">
                    <FaPlus /> Criar Comunidade
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communities.map((community) => (
                    <div key={community.id} className="bg-white rounded-xl p-5 shadow-card hover:shadow-lg transition-shadow border border-transparent hover:border-primary/20">
                        <div className="flex items-start gap-4">
                            <img
                                src={community.image}
                                alt={community.name}
                                className="w-16 h-16 rounded-xl object-cover"
                            />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-text-main mb-1">{community.name}</h3>
                                <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                                    {community.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-text-secondary font-medium">
                                        {community.members} membros
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/community/${community.id}`)}
                                            className="px-4 py-1.5 rounded-full text-sm font-bold bg-primary-light text-primary hover:bg-primary hover:text-white transition-colors"
                                        >
                                            Visitar
                                        </button>
                                        <button className="px-4 py-1.5 rounded-full text-sm font-bold border border-primary text-primary hover:bg-primary-light transition-colors">
                                            Entrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Communities;
