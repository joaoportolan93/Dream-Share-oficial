import React from 'react';
import { FaSearch, FaHome, FaBell, FaCog, FaCloud } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 h-[60px] bg-white shadow-sm z-50 flex items-center justify-between px-4 lg:px-6">
            {/* Logo Section */}
            <div className="flex items-center gap-2 w-[250px]">
                <div className="text-2xl text-primary">
                    <FaCloud />
                </div>
                <Link to="/" className="text-lg font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                    DreamShare
                </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-[500px] mx-4">
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Busque sonhos, pessoas, hashtags..."
                        className="w-full h-[40px] bg-background-input rounded-full pl-5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm" />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-5">
                <button className="text-text-secondary hover:text-primary transition-colors">
                    <FaHome size={20} />
                </button>
                <button className="text-text-secondary hover:text-primary transition-colors relative">
                    <FaBell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="md:hidden text-text-secondary hover:text-primary transition-colors">
                    <FaSearch size={20} />
                </button>
                <button className="text-text-secondary hover:text-primary transition-colors">
                    <FaCog size={20} />
                </button>

                {/* Profile */}
                <div className="w-[35px] h-[35px] rounded-full border-2 border-secondary overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                    <img
                        src="https://randomuser.me/api/portraits/women/44.jpg"
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
