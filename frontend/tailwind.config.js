/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'spin-slow': 'spin 3s linear infinite',
            },
            colors: {
                primary: {
                    DEFAULT: '#8B5CF6', // Roxo principal
                    light: '#EDE9FE',   // Roxo claro (hover/ativo)
                    dark: '#7C3AED',
                },
                secondary: {
                    DEFAULT: '#6366F1', // Azul
                },
                accent: {
                    blue: '#3B82F6',    // Azul links/hashtags
                },
                text: {
                    main: '#1F2937',    // Cinza escuro/Preto suave
                    secondary: '#6B7280', // Cinza texto secundário
                },
                background: {
                    main: '#F9FAFB',    // Fundo geral
                    card: '#FFFFFF',    // Fundo cards
                    input: '#F3F4F6',   // Fundo inputs
                },
                // Cosmic Theme Colors
                cosmic: {
                    bg: '#211950',         // Dark Cosmic Blue (User Ref)
                    purple: '#8A2BE2',     // Bright Purple (User Ref)
                    card: 'rgba(33, 25, 80, 0.7)', // Translucent card for dark mode
                },
                border: {
                    DEFAULT: '#E5E7EB', // Cinza borda
                }
            },
            backgroundImage: {
                'galaxy-gradient': 'linear-gradient(135deg, #211950 0%, #8A2BE2 50%, #211950 100%)',
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 1px 3px rgba(0,0,0,0.1)',
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'glow': '0 4px 12px rgba(139, 92, 246, 0.3)',
                'cosmic-glow': '0 0 15px rgba(138, 43, 226, 0.5)',
            }
        },
    },
    plugins: [],
}
