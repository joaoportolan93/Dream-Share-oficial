import React from 'react';
// import { Link } from 'react-router-dom'; // TODO: Setup Router
import { FaMoon, FaHome } from 'react-icons/fa';

// Gerando estrelas aleatórias
const generateStars = (count) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            id: i,
            size: Math.random() * 4 + 1,
            opacity: Math.random() * 0.7 + 0.3,
            top: Math.random() * 100,
            left: Math.random() * 100,
            duration: Math.random() * 5 + 2
        });
    }
    return stars;
};

const stars = generateStars(100);

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center text-center px-8 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] relative overflow-hidden text-white">
            {/* Background Image */}
            <div
                className="absolute top-0 left-0 right-0 bottom-0 opacity-5 z-0"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1494&q=80')",
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                }}
            />

            {/* Stars Container */}
            <div className="absolute top-0 left-0 right-0 bottom-0 z-0">
                {stars.map(star => (
                    <div
                        key={star.id}
                        className="absolute bg-white rounded-full animate-pulse"
                        style={{
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            opacity: star.opacity,
                            top: `${star.top}%`,
                            left: `${star.left}%`,
                            animationDuration: `${star.duration}s`
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-2xl">
                <div className="text-8xl opacity-90 mb-6 animate-bounce">
                    <FaMoon />
                </div>

                <h1 className="text-8xl md:text-9xl font-bold m-0 text-white drop-shadow-lg">
                    404
                </h1>

                <h2 className="text-3xl md:text-4xl font-semibold my-6 text-white drop-shadow-md">
                    Sonho Não Encontrado
                </h2>

                <p className="text-lg md:text-xl mb-8 text-white opacity-90 max-w-lg mx-auto">
                    Parece que você vagou muito longe no mundo dos sonhos.
                    A página que você está procurando não existe ou acordou.
                </p>

                <button
                    className="flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-white text-[#302b63] rounded-full shadow-lg mb-8 mx-auto transition-transform hover:scale-105 cursor-pointer"
                    onClick={() => window.location.href = '/'}
                >
                    <FaHome className="text-xl" />
                    Voltar ao Início
                </button>
            </div>
        </div>
    );
};

export default NotFound;
