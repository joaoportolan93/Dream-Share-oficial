/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
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
                border: {
                    DEFAULT: '#E5E7EB', // Cinza borda
                }
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 1px 3px rgba(0,0,0,0.1)',
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'glow': '0 4px 12px rgba(139, 92, 246, 0.3)',
            }
        },
    },
    plugins: [],
}
