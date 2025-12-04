import React from 'react';
import { useParams } from 'react-router-dom';
import Post from '../components/Post';

const CommunityPage = () => {
    const { id } = useParams();

    // Dummy data based on ID (in a real app, fetch from API)
    const communityData = {
        'sonhos-lucidos': {
            name: 'Sonhos Lúcidos',
            description: 'Compartilhe técnicas e experiências sobre como controlar seus sonhos.',
            members: '15.4k',
            image: 'https://picsum.photos/seed/lucid/600/200',
            posts: [
                {
                    id: 1,
                    userName: "ana_sleep",
                    userImage: "https://randomuser.me/api/portraits/women/21.jpg",
                    time: "5 horas atrás",
                    title: "Consegui voar pela primeira vez!",
                    content: "Usei a técnica de olhar para as mãos e funcionou. A sensação foi incrível.",
                    image: "https://picsum.photos/seed/fly/600/300",
                    tags: ["#sonholucido", "#voo"]
                },
                {
                    id: 2,
                    userName: "dream_master",
                    userImage: "https://randomuser.me/api/portraits/men/32.jpg",
                    time: "1 dia atrás",
                    title: "Reality Check falhou...",
                    content: "Tentei atravessar a parede mas bati a cara. Alguém tem dicas?",
                    image: "https://picsum.photos/seed/wall/600/300",
                    tags: ["#realitycheck", "#duvida"]
                }
            ]
        },
        'pesadelos': {
            name: 'Pesadelos',
            description: 'Um espaço seguro para discutir e entender seus sonhos mais assustadores.',
            members: '8.2k',
            image: 'https://picsum.photos/seed/nightmare/600/200',
            posts: []
        }
    };

    const community = communityData[id] || {
        name: 'Comunidade não encontrada',
        description: '',
        members: '0',
        image: 'https://picsum.photos/seed/error/600/200',
        posts: []
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Community Header */}
            <div className="bg-white rounded-xl overflow-hidden shadow-card">
                <div className="h-32 w-full bg-gray-200">
                    <img src={community.image} alt="Banner" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-text-main mb-2">{community.name}</h1>
                            <p className="text-text-secondary mb-4 max-w-2xl">{community.description}</p>
                            <div className="flex items-center gap-4 text-sm text-text-secondary font-medium">
                                <span>{community.members} membros</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="text-green-500 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    142 online
                                </span>
                            </div>
                        </div>
                        <button className="bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-primary-dark transition-colors">
                            Entrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Post Input (Simplified) */}
            <div className="bg-white rounded-xl p-4 shadow-card flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <input
                    type="text"
                    placeholder={`Criar post em ${community.name}`}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                    readOnly
                />
            </div>

            {/* Posts Feed */}
            <div className="flex flex-col">
                {community.posts.length > 0 ? (
                    community.posts.map((post) => (
                        <Post key={post.id} post={post} />
                    ))
                ) : (
                    <div className="bg-white rounded-xl p-8 text-center shadow-card">
                        <p className="text-text-secondary">Ainda não há posts nesta comunidade.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;
