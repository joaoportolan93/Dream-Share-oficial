import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaFire,
    FaClock,
    FaRandom,
    FaSearch,
    FaHeart,
    FaComment,
    FaStar,
    FaMoon,
    FaEye,
    FaMobileAlt,
    FaCloud,
    FaUserPlus,
    FaCheck
} from 'react-icons/fa';

const ExplorePage = () => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('trending');
    const [searchQuery, setSearchQuery] = useState('');
    const [followingUsers, setFollowingUsers] = useState([]);

    // Toggle follow state for a user
    const toggleFollow = (userId) => {
        setFollowingUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    // Mock Data for Dream Cards
    const dreams = [
        {
            id: 1,
            title: "Cidade Flutuante de Cristal",
            category: "Sonhos Lúcidos",
            author: "Luna Sky",
            likes: 1240,
            comments: 85,
            image: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=2542&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "Conversa com Ancestrais",
            category: "Espiritual",
            author: "Zen Master",
            likes: 890,
            comments: 42,
            image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2568&auto=format&fit=crop"
        },
        {
            id: 3,
            title: "Voando sobre Neom",
            category: "Futurismo",
            author: "Cyber Dremer",
            likes: 2100,
            comments: 310,
            image: "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=2600&auto=format&fit=crop"
        },
        {
            id: 4,
            title: "O Labirinto Infinito",
            category: "Pesadelo",
            author: "Dark Walker",
            likes: 65,
            comments: 12,
            image: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=2574&auto=format&fit=crop"
        }
    ];

    // Filter dreams based on search query
    const filteredDreams = dreams.filter(dream => 
        dream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dream.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dream.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Mock Data for Suggestions
    const suggestions = [
        { id: 1, name: "Astral Traveler", handle: "@astral_t", bio: "Explorando o multiverso onírico." },
        { id: 2, name: "Lucid Dreamer", handle: "@lucid_d", bio: "Mestre em controle de sonhos." },
        { id: 3, name: "Night Owl", handle: "@night_owl", bio: "Sonhos noturnos e visões." },
    ];

    // Handle search submission
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className="w-full min-h-screen bg-background-main dark:bg-cosmic-bg text-text-main dark:text-white p-4 font-sans transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* === MAIN COLUMN (70%) === */}
                <div className="lg:col-span-8 space-y-8">

                    {/* 1. Hero Banner */}
                    <div className="relative overflow-hidden rounded-2xl p-8 h-[280px] flex items-center shadow-cosmic-glow group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 opacity-90 z-0"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 z-0"></div>
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-cosmic-accent blur-[100px] opacity-40 rounded-full"></div>

                        <div className="relative z-10 max-w-2xl">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 drop-shadow-sm">
                                Explorar Sonhos
                            </h1>
                            <p className="text-lg text-blue-100 max-w-lg leading-relaxed">
                                Mergulhe em um universo de subconscientes compartilhados. Descubra, inspire-se e conecte-se através das infinitas possibilidades do mundo onírico.
                            </p>
                        </div>
                    </div>

                    {/* 2. Search Bar */}
                    <form onSubmit={handleSearch} className="relative">
                        <div className="flex items-center bg-white dark:bg-cosmic-card border border-border dark:border-white/10 rounded-xl overflow-hidden shadow-card hover:border-primary/30 dark:hover:border-cosmic-accent/50 transition-all">
                            <div className="pl-4 text-gray-400">
                                <FaSearch size={18} />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Pesquisar sonhos, categorias, usuários..."
                                className="flex-1 px-4 py-3 bg-transparent text-text-main dark:text-white placeholder-gray-500 focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="px-3 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                                >
                                    ×
                                </button>
                            )}
                            <button
                                type="submit"
                                className="px-6 py-3 bg-primary dark:bg-cosmic-accent text-white font-semibold hover:opacity-90 transition-opacity"
                            >
                                Buscar
                            </button>
                        </div>
                    </form>

                    {/* 3. Filters & Input */}
                    <div className="space-y-6">
                        {/* Filter Pills */}
                        <div className="flex flex-wrap gap-4">
                            <FilterPill
                                title="Em Alta"
                                icon={<FaFire />}
                                active={activeFilter === 'trending'}
                                onClick={() => setActiveFilter('trending')}
                            />
                            <FilterPill
                                title="Recentes"
                                icon={<FaClock />}
                                active={activeFilter === 'recent'}
                                onClick={() => setActiveFilter('recent')}
                            />
                            <FilterPill
                                title="Aleatório"
                                icon={<FaRandom />}
                                active={activeFilter === 'random'}
                                onClick={() => setActiveFilter('random')}
                            />
                        </div>

                        {/* New Post Placeholder */}
                        <div 
                            onClick={() => navigate('/create')}
                            className="bg-white dark:bg-cosmic-card border border-border dark:border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 dark:hover:border-cosmic-accent/50 transition-all cursor-pointer shadow-card dark:shadow-soft"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 overflow-hidden">
                                {localStorage.getItem('user') ? (
                                    <img
                                        src={JSON.parse(localStorage.getItem('user')).avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700"></div>
                                )}
                            </div>
                            <span className="text-text-secondary dark:text-cosmic-text-muted text-lg font-medium">Compartilhe, veja sonhos...</span>
                        </div>
                    </div>

                    {/* 3. Bento Grid Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Insert Widget "Dicas para Sonhar" in the grid flow */}
                        <div className="row-span-2 bg-white dark:bg-gradient-to-b dark:from-purple-900/50 dark:to-cosmic-card border border-border dark:border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-card dark:shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <div>
                                <div className="flex items-center gap-2 mb-6 text-yellow-600 dark:text-yellow-300">
                                    <FaStar className="text-2xl" />
                                    <h3 className="text-xl font-bold uppercase tracking-wider text-text-main dark:text-white">Dicas para Sonhar</h3>
                                </div>
                                <ul className="space-y-4">
                                    <TipItem icon={<FaMoon className="text-blue-300" />} text="Mantenha um horário de sono regular." />
                                    <TipItem icon={<FaEye className="text-purple-300" />} text="Faça verificações de realidade durante o dia." />
                                    <TipItem icon={<FaMobileAlt className="text-red-300" />} text="Evite telas 1h antes de dormir." />
                                    <TipItem icon={<FaCloud className="text-white/60" />} text="Anote seus sonhos assim que acordar." />
                                </ul>
                            </div>
                            <button className="mt-8 w-full py-3 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors font-semibold text-sm uppercase tracking-wide text-text-main dark:text-white">
                                Ver Guia Completo
                            </button>
                        </div>

                        {/* Dream Cards - Using filtered dreams */}
                        {filteredDreams.map((dream) => (
                            <DreamCard key={dream.id} data={dream} />
                        ))}
                        
                        {filteredDreams.length === 0 && searchQuery && (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                <p className="text-lg">Nenhum sonho encontrado para "{searchQuery}"</p>
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="mt-4 text-primary dark:text-cosmic-accent hover:underline"
                                >
                                    Limpar pesquisa
                                </button>
                            </div>
                        )}
                    </div>

                </div>

                {/* === SIDEBAR COLUMN (30%) === */}
                <div className="lg:col-span-4 space-y-8 hidden lg:block">

                    {/* Widget: Sugestões para seguir */}
                    <div className="bg-white dark:bg-cosmic-card/80 dark:backdrop-blur-md border border-border dark:border-white/10 rounded-2xl p-6 shadow-card dark:shadow-soft">
                        <h3 className="text-lg font-bold mb-6 text-text-main dark:text-white border-b border-border dark:border-white/5 pb-2">Sugestões para seguir</h3>
                        <div className="space-y-5">
                            {suggestions.map(user => (
                                <div key={user.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden ring-2 ring-transparent group-hover:ring-primary dark:group-hover:ring-cosmic-accent transition-all">
                                            <img src={`https://i.pravatar.cc/150?u=${user.id + 20}`} alt={user.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm leading-tight text-text-main dark:text-white">{user.name}</p>
                                            <p className="text-xs text-text-secondary dark:text-cosmic-text-muted">{user.handle}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => toggleFollow(user.id)}
                                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors shadow-glow ${
                                            followingUsers.includes(user.id)
                                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                                : 'bg-cosmic-accent hover:bg-violet-600 text-white'
                                        }`}
                                    >
                                        {followingUsers.includes(user.id) ? (
                                            <>
                                                <FaCheck size={10} />
                                                Seguindo
                                            </>
                                        ) : (
                                            <>
                                                <FaUserPlus size={10} />
                                                Seguir
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 text-xs text-primary dark:text-cosmic-accent hover:text-primary-dark dark:hover:text-white transition-colors uppercase tracking-widest font-bold">
                            Ver mais
                        </button>
                    </div>

                    {/* Widget: Insights de Sonhos */}
                    <div className="bg-white dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-cosmic-card border border-border dark:border-white/10 rounded-2xl p-6 shadow-card relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-pink-500 blur-[80px] opacity-20"></div>

                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl text-primary dark:text-purple-300">
                                <FaCloud size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-text-main dark:text-white">Voar em sonhos</h4>
                                <span className="text-xs text-primary dark:text-purple-300 uppercase font-semibold tracking-wide">Insight Semanal</span>
                            </div>
                        </div>
                        <p className="text-sm text-text-secondary dark:text-gray-300 leading-relaxed mb-4">
                            Sonhar que está voando geralmente indica um desejo de liberdade ou sucesso em superar obstáculos. Você já teve esse sonho esta semana?
                        </p>
                        <div className="flex gap-2">
                            <div className="h-1 flex-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-purple-500 rounded-full"></div>
                            </div>
                            <span className="text-xs text-text-secondary dark:text-gray-400">75% dos usuários</span>
                        </div>
                    </div>

                    {/* Small Footer Links */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-secondary/50 dark:text-white/20 px-2 text-center justify-center">
                        <button onClick={() => navigate('/about')} className="hover:text-text-main dark:hover:text-white/50 transition-colors">Sobre</button>
                        <button onClick={() => navigate('/privacy')} className="hover:text-text-main dark:hover:text-white/50 transition-colors">Privacidade</button>
                        <button onClick={() => navigate('/terms')} className="hover:text-text-main dark:hover:text-white/50 transition-colors">Termos</button>
                        <button onClick={() => navigate('/help')} className="hover:text-text-main dark:hover:text-white/50 transition-colors">Ajuda</button>
                        <span>© 2025 DreamShare</span>
                    </div>

                </div>
            </div>
        </div>
    );
};

/* --- Subcomponents --- */

const FilterPill = ({ title, icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${active
            ? 'bg-primary dark:bg-cosmic-accent border-primary dark:border-cosmic-accent text-white shadow-glow'
            : 'bg-gray-100 dark:bg-white/5 border-border dark:border-white/10 text-text-secondary dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/30'
            }`}
    >
        {icon}
        {title}
    </button>
);

const TipItem = ({ icon, text }) => (
    <li className="flex items-center gap-3 text-sm text-text-secondary dark:text-gray-300 p-2 rounded-lg bg-gray-100 dark:bg-black/10 hover:bg-gray-200 dark:hover:bg-black/20 transition-colors cursor-default">
        <span className="text-lg">{icon}</span>
        {text}
    </li>
);

const DreamCard = ({ data }) => (
    <div className="group bg-white dark:bg-cosmic-card border border-border dark:border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 dark:hover:border-white/20 transition-all duration-300 shadow-card hover:shadow-lg dark:hover:shadow-glow flex flex-col h-full">
        <div className="relative aspect-video overflow-hidden">
            <img
                src={data.image}
                alt={data.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-3 left-3">
                <span className="px-2 py-1 rounded bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                    {data.category}
                </span>
            </div>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-bold text-text-main dark:text-white mb-1 group-hover:text-primary dark:group-hover:text-purple-300 transition-colors line-clamp-1">{data.title}</h3>
                <p className="text-sm text-text-secondary dark:text-cosmic-text-muted mb-4">por <span className="text-text-main dark:text-white hover:underline cursor-pointer">{data.author}</span></p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border dark:border-white/5">
                <div className="flex gap-4">
                    <button className="flex items-center gap-1.5 text-text-secondary dark:text-gray-400 hover:text-pink-500 transition-colors text-sm">
                        <FaHeart /> <span>{data.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-text-secondary dark:text-gray-400 hover:text-blue-400 transition-colors text-sm">
                        <FaComment /> <span>{data.comments}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export default ExplorePage;
