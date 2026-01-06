import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaHome, FaBell, FaCog, FaCloud, FaUser, FaEdit, FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { logout, getProfile } from '../services/api';

const Header = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery(''); // clear after search or keep it? usually better to keep but let's clear for now or simple nav
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Fetch user profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getProfile();
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        fetchProfile();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        navigate('/login');
    };

    const avatarUrl = user?.avatar_url || 'https://randomuser.me/api/portraits/women/44.jpg';

    return (
        <header className="fixed top-0 left-0 right-0 h-[60px] bg-white dark:bg-cosmic-bg dark:border-b dark:border-white/10 shadow-sm z-50 flex items-center justify-between px-4 lg:px-6 transition-colors duration-300">
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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Busque sonhos, pessoas, hashtags..."
                        className="w-full h-[40px] bg-background-input dark:bg-white/10 dark:text-white dark:placeholder-gray-400 rounded-full pl-5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary dark:text-gray-400 text-sm hover:text-primary transition-colors"
                    >
                        <FaSearch />
                    </button>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-5">
                <ThemeToggle />
                <Link to="/" className="text-text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors">
                    <FaHome size={20} />
                </Link>
                <Link to="/notifications" className="text-text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors relative">
                    <FaBell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Link>
                <button className="md:hidden text-text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors">
                    <FaSearch size={20} />
                </button>
                <Link to="/settings" className="text-text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors">
                    <FaCog size={20} />
                </Link>

                {/* Profile with Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="w-[35px] h-[35px] rounded-full border-2 border-secondary overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    >
                        <img
                            src={avatarUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                <p className="font-semibold text-gray-800 dark:text-white truncate">
                                    {user?.nome_completo || 'Usuário'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    @{user?.nome_usuario || 'username'}
                                </p>
                            </div>
                            <Link
                                to="/profile"
                                className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setShowDropdown(false)}
                            >
                                <FaUser size={16} />
                                Perfil
                            </Link>
                            <Link
                                to="/edit-profile"
                                className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setShowDropdown(false)}
                            >
                                <FaEdit size={16} />
                                Editar Perfil
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <FaSignOutAlt size={16} />
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
