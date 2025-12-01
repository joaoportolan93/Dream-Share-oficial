import React, { useState } from 'react';
// import { useParams } from 'react-router-dom'; // TODO: Setup Router
import { FaCalendarAlt, FaMapMarkerAlt, FaLink, FaUserPlus, FaEllipsisH } from 'react-icons/fa';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('dreams');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            {/* Profile Header */}
            <div className="relative bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-xl p-8 mb-6 overflow-hidden text-white max-w-5xl mx-auto mt-8">
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
                        src="https://randomuser.me/api/portraits/women/44.jpg"
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-white object-cover"
                    />

                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                        <h1 className="text-3xl font-bold mb-2">Lucia Santos</h1>
                        <h2 className="text-lg mb-4 opacity-90">@luciasantos</h2>
                        <p className="mb-4 leading-relaxed max-w-2xl">
                            Exploradora do onírico. Sonhando acordada e dormindo.
                            Apaixonada por sonhos lúcidos e interpretação de símbolos.
                        </p>

                        <div className="flex gap-6 flex-wrap mb-4 justify-center md:justify-start">
                            <div className="flex items-center gap-2 text-sm">
                                <FaMapMarkerAlt className="opacity-90" />
                                <span>São Paulo, SP</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <FaLink className="opacity-90" />
                                <a href="#" className="hover:underline">luciasantos.com</a>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <FaCalendarAlt className="opacity-90" />
                                <span>Entrou em Setembro 2023</span>
                            </div>
                        </div>

                        <div className="flex gap-8 mb-6 justify-center md:justify-start">
                            <div className="text-center md:text-left">
                                <div className="text-xl font-bold">142</div>
                                <div className="text-sm opacity-90">Sonhos</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-xl font-bold">1.2k</div>
                                <div className="text-sm opacity-90">Seguidores</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-xl font-bold">850</div>
                                <div className="text-sm opacity-90">Seguindo</div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 px-6 py-3 bg-white text-[#764ba2] rounded-full font-semibold transition-transform hover:-translate-y-0.5">
                                <FaUserPlus />
                                Seguir
                            </button>
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
                <div className="flex border-b border-white/10 mb-8">
                    <button
                        className={`px-6 py-4 text-base transition-colors ${activeTab === 'dreams'
                                ? 'border-b-4 border-purple-500 text-purple-400 font-semibold'
                                : 'text-gray-400 hover:text-purple-400'
                            }`}
                        onClick={() => setActiveTab('dreams')}
                    >
                        Sonhos
                    </button>
                    <button
                        className={`px-6 py-4 text-base transition-colors ${activeTab === 'journal'
                                ? 'border-b-4 border-purple-500 text-purple-400 font-semibold'
                                : 'text-gray-400 hover:text-purple-400'
                            }`}
                        onClick={() => setActiveTab('journal')}
                    >
                        Diário
                    </button>
                    <button
                        className={`px-6 py-4 text-base transition-colors ${activeTab === 'saved'
                                ? 'border-b-4 border-purple-500 text-purple-400 font-semibold'
                                : 'text-gray-400 hover:text-purple-400'
                            }`}
                        onClick={() => setActiveTab('saved')}
                    >
                        Salvos
                    </button>
                </div>

                {/* Grid Container */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                            key={item}
                            className="relative overflow-hidden rounded-xl aspect-square cursor-pointer bg-gradient-to-br from-purple-600 to-pink-500 hover:scale-105 transition-transform"
                        >
                            <div className="p-4 text-white flex items-center justify-center h-full font-semibold text-lg">
                                Sonho #{item}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Profile;
