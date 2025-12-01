import React, { useState } from 'react';
// import Layout from '../components/Layout'; // TODO: Migrate Layout
// import CreateDreamPost from '../components/CreateDreamPost'; // TODO: Migrate CreateDreamPost
// import DreamCard from '../components/DreamCard'; // TODO: Migrate DreamCard
import { FaMoon, FaStar, FaFire, FaRandom } from 'react-icons/fa';
import { RiMoonClearFill } from 'react-icons/ri';

const HomeAlternative = () => {
    const [activeFilter, setActiveFilter] = useState('trending');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="mb-4 text-white text-4xl relative inline-block">
                        Explorar Sonhos
                        <span className="absolute bottom-[-8px] left-0 w-3/5 h-1 bg-gradient-to-r from-[#654ea3] to-[#eaafc8] rounded-sm"></span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl">
                        Descubra o subconsciente coletivo. Navegue por sonhos compartilhados de todo o mundo.
                    </p>
                </div>

                {/* Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Main Column */}
                    <div className="lg:col-span-2">
                        {/* Filter Tabs */}
                        <div className="flex bg-white/5 rounded-xl p-2 mb-6 overflow-x-auto">
                            <button
                                className={`flex-1 min-w-fit px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${activeFilter === 'trending'
                                        ? 'bg-[#654ea3] text-white'
                                        : 'text-gray-400 hover:bg-white/5'
                                    }`}
                                onClick={() => setActiveFilter('trending')}
                            >
                                <FaFire />
                                Em Alta
                            </button>
                            <button
                                className={`flex-1 min-w-fit px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${activeFilter === 'recent'
                                        ? 'bg-[#654ea3] text-white'
                                        : 'text-gray-400 hover:bg-white/5'
                                    }`}
                                onClick={() => setActiveFilter('recent')}
                            >
                                <FaMoon />
                                Recentes
                            </button>
                            <button
                                className={`flex-1 min-w-fit px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${activeFilter === 'random'
                                        ? 'bg-[#654ea3] text-white'
                                        : 'text-gray-400 hover:bg-white/5'
                                    }`}
                                onClick={() => setActiveFilter('random')}
                            >
                                <FaRandom />
                                Aleatório
                            </button>
                        </div>

                        {/* CreateDreamPost Placeholder */}
                        <div className="mb-6 p-6 rounded-xl bg-white/5 border border-white/10 text-center text-gray-400">
                            CreateDreamPost Placeholder
                        </div>

                        {/* Feed Content Placeholder */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="mb-6 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white">
                                <h3 className="text-xl font-bold mb-2 text-purple-300">Dream Post #{i}</h3>
                                <p className="text-gray-300">Conteúdo do sonho aqui...</p>
                            </div>
                        ))}
                    </div>

                    {/* Side Column */}
                    <div className="lg:col-span-1">
                        {/* Tips Card */}
                        <div className="bg-white/5 rounded-xl p-5 mb-6 border border-white/10">
                            <h3 className="text-lg text-[#eaafc8] mb-4 flex items-center gap-2">
                                <FaStar />
                                Dicas para Sonhar
                            </h3>
                            <ul className="list-none p-0 m-0">
                                <li className="mb-3 pb-3 border-b border-white/10 text-sm text-gray-300 flex items-start gap-3 last:border-0 last:mb-0 last:pb-0">
                                    <RiMoonClearFill className="text-blue-400 flex-shrink-0 mt-1" />
                                    <span>Mantenha um diário de sonhos ao lado da cama.</span>
                                </li>
                                <li className="mb-3 pb-3 border-b border-white/10 text-sm text-gray-300 flex items-start gap-3 last:border-0 last:mb-0 last:pb-0">
                                    <RiMoonClearFill className="text-blue-400 flex-shrink-0 mt-1" />
                                    <span>Faça testes de realidade durante o dia.</span>
                                </li>
                                <li className="mb-3 pb-3 border-b border-white/10 text-sm text-gray-300 flex items-start gap-3 last:border-0 last:mb-0 last:pb-0">
                                    <RiMoonClearFill className="text-blue-400 flex-shrink-0 mt-1" />
                                    <span>Evite telas 1 hora antes de dormir.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Dream Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-[#302b63] text-white p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold mb-1">24k</div>
                                <div className="text-xs opacity-90">Sonhos</div>
                            </div>
                            <div className="bg-[#302b63] text-white p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold mb-1">8.5k</div>
                                <div className="text-xs opacity-90">Sonhadores</div>
                            </div>
                        </div>

                        {/* Quote Card */}
                        <div className="bg-[#764ba2] text-white p-5 rounded-xl relative overflow-hidden">
                            <p className="italic mb-2 relative z-10">
                                "Sonho é o que a alma escreve."
                            </p>
                            <div className="text-right text-sm opacity-90">- José Saramago</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeAlternative;
