import React, { useEffect, useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

/**
 * ThemeToggle Component
 * Allows users to switch between Light and Cosmic Dark modes.
 * Persists preference in localStorage.
 */
const ThemeToggle = () => {
    // Initialize theme from localStorage, defaulting to dark mode
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme === 'dark';
            }
            return true; // Default to dark mode
        }
        return true;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50
            bg-gray-200 text-gray-800 hover:bg-gray-300
            dark:bg-cosmic-card dark:text-yellow-400 dark:hover:bg-opacity-80
            shadow-md dark:shadow-cosmic-glow"
            aria-label="Toggle Dark Mode"
            title={isDark ? "Switch to Light Mode" : "Switch to Cosmic Mode"}
        >
            {isDark ? (
                <FaSun size={20} className="animate-spin-slow" />
            ) : (
                <FaMoon size={20} />
            )}
        </button>
    );
};

export default ThemeToggle;
