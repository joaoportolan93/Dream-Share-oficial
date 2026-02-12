import React from 'react';
import { FaCloud, FaFeather } from 'react-icons/fa';
import SuggestionsCard from './SuggestionsCard';

const SidebarRight = () => {
    const insights = [
        { title: 'Voar em sonhos', desc: 'Sonhar que está voando geralmente representa sensação de liberdade e controle sobre a própria vida.', icon: FaCloud },
        { title: 'Cair em sonhos', desc: 'Sensação de queda durante o sonho frequentemente está associada a inseguranças e perda de controle.', icon: FaFeather },
    ];

    return (
        <aside className="hidden lg:flex flex-col w-[320px] fixed right-0 top-[60px] bottom-0 bg-background-main dark:bg-transparent p-5 overflow-y-auto transition-colors duration-300">
            {/* Suggestions Card — shared component */}
            <div className="mb-6">
                <SuggestionsCard variant="sidebar" maxUsers={5} />
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
