import React from 'react';
import { FaHome, FaMoon, FaUserFriends, FaBookmark, FaStar, FaPlus } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const SidebarLeft = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const menuItems = [
        { icon: FaHome, label: 'Início', path: '/' },
        { icon: FaMoon, label: 'Explorar', path: '/explore' },
        { icon: FaUserFriends, label: 'Amigos', path: '/friends' },
        { icon: FaBookmark, label: 'Salvos', path: '/saved' },
        { icon: FaStar, label: 'Destaques', path: '/highlights' },
    ];

    const trends = [
        { tag: '#sonholucido', count: '5.234 sonhos' },
        { tag: '#voando', count: '3.120 sonhos' },
        { tag: '#apocalipse', count: '1.890 sonhos' },
        { tag: '#mar', count: '1.200 sonhos' },
    ];

    return (
        <aside className="hidden md:flex flex-col w-[250px] fixed left-0 top-[60px] bottom-0 bg-white p-5 overflow-y-auto border-r border-border">
            {/* Navigation Menu */}
            <nav className="flex flex-col gap-2 mb-6">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive(item.path)
                                ? 'bg-primary-light text-primary'
                                : 'text-text-secondary hover:bg-background-input hover:text-text-main'
                            }`}
                    >
                        <item.icon size={20} className={isActive(item.path) ? 'text-primary' : 'text-gray-400'} />
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* New Dream Button */}
            <button className="w-full h-[45px] bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-full flex items-center justify-center gap-2 shadow-glow hover:opacity-90 transition-all transform hover:scale-[1.02] mb-8">
                <FaPlus />
                Novo Sonho
            </button>

            {/* Trends Section */}
            <div>
                <h3 className="text-sm font-bold text-text-main mb-4 px-2">Tendências</h3>
                <div className="flex flex-col gap-4 px-2">
                    {trends.map((trend, index) => (
                        <div key={index} className="flex flex-col cursor-pointer group">
                            <span className="text-accent-blue font-medium text-sm group-hover:underline">
                                {trend.tag}
                            </span>
                            <span className="text-xs text-text-secondary">
                                {trend.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default SidebarLeft;
