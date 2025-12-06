import React from 'react';
import { FaCloud, FaFeather } from 'react-icons/fa';

const SidebarRight = () => {
    const suggestions = [
        { name: 'mariasilva', desc: 'Sonhadora frequente', img: 'https://randomuser.me/api/portraits/women/12.jpg' },
        { name: 'pedrocosta', desc: 'Sonhos lúcidos', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { name: 'anabecker', desc: 'Interpretação de sonhos', img: 'https://randomuser.me/api/portraits/women/65.jpg' },
    ];

    const insights = [
        { title: 'Voar em sonhos', desc: 'Sonhar que está voando geralmente representa sensação de liberdade e controle sobre a própria vida.', icon: FaCloud },
        { title: 'Cair em sonhos', desc: 'Sensação de queda durante o sonho frequentemente está associada a inseguranças e perda de controle.', icon: FaFeather },
    ];

    return (
        <aside className="hidden lg:flex flex-col w-[320px] fixed right-0 top-[60px] bottom-0 bg-background-main dark:bg-transparent p-5 overflow-y-auto transition-colors duration-300">
            {/* Suggestions Card */}
            <div className="bg-white dark:bg-cosmic-card dark:border dark:border-white/5 rounded-xl p-5 shadow-card mb-6 transition-colors duration-300">
                <h3 className="text-text-main dark:text-white font-bold text-sm mb-4">Sugestões para seguir</h3>
                <div className="flex flex-col gap-4">
                    {suggestions.map((user, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={user.img} alt={user.name} className="w-[45px] h-[45px] rounded-full object-cover" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-text-main dark:text-white">{user.name}</span>
                                    <span className="text-xs text-text-secondary dark:text-gray-400 max-w-[100px] truncate">{user.desc}</span>
                                </div>
                            </div>
                            <button className="bg-primary text-white text-xs font-medium px-4 py-1.5 rounded-full hover:bg-primary-dark transition-colors">
                                + Seguir
                            </button>
                        </div>
                    ))}
                </div>
                <button className="w-full text-center text-accent-blue text-sm font-medium mt-4 hover:underline">
                    Ver mais
                </button>
            </div>

            {/* Insights Card */}
            <div className="bg-white dark:bg-cosmic-card dark:border dark:border-white/5 rounded-xl p-5 shadow-card transition-colors duration-300">
                <h3 className="text-text-main dark:text-white font-bold text-sm mb-4">Insights de Sonhos</h3>
                <div className="flex flex-col gap-6">
                    {insights.map((item, index) => (
                        <div key={index} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-text-main dark:text-white font-bold text-sm">
                                <item.icon className="text-primary" />
                                {item.title}
                            </div>
                            <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default SidebarRight;
