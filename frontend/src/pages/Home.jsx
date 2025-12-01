import React from 'react';
import { FaImage, FaSmile, FaMapMarkerAlt, FaMusic } from 'react-icons/fa';
import { MdGif } from 'react-icons/md';

const Home = () => {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-primary mb-2">Início</h1>

            {/* Welcome Card */}
            <div className="w-full bg-gradient-to-r from-secondary via-purple-500 to-orange-400 rounded-2xl p-8 shadow-soft text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-3">Bem-vindo ao DreamShare!</h2>
                    <p className="text-white/90 mb-6 max-w-[400px] leading-relaxed">
                        Compartilhe seus sonhos, conecte-se com outros sonhadores e explore as múltiplas camadas do mundo onírico.
                    </p>
                    <button className="bg-white text-primary font-bold py-2.5 px-6 rounded-full text-sm hover:bg-gray-50 transition-colors">
                        Saiba mais
                    </button>
                </div>
                {/* Decorative circle */}
                <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Create Post Card */}
            <div className="bg-white rounded-xl p-5 shadow-card">
                <div className="flex gap-3 mb-4">
                    <img
                        src="https://randomuser.me/api/portraits/men/32.jpg"
                        alt="User"
                        className="w-[40px] h-[40px] rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Qual o título do seu sonho?"
                            className="w-full h-[45px] bg-background-input rounded-lg px-4 text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                        <textarea
                            placeholder="Descreva seu sonho em detalhes... O que aconteceu? Como você se sentiu?"
                            className="w-full min-h-[120px] bg-background-input rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                        ></textarea>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex gap-4 text-text-secondary">
                        <button className="hover:text-primary transition-colors"><FaImage size={18} /></button>
                        <button className="hover:text-primary transition-colors"><MdGif size={24} /></button>
                        <button className="hover:text-primary transition-colors"><FaSmile size={18} /></button>
                        <button className="hover:text-primary transition-colors"><FaMapMarkerAlt size={18} /></button>
                        <button className="hover:text-primary transition-colors"><FaMusic size={18} /></button>
                    </div>
                    <button className="bg-primary/50 text-white font-medium py-2 px-6 rounded-full text-sm cursor-not-allowed">
                        Compartilhar
                    </button>
                </div>
            </div>

            {/* Feed Posts Placeholder */}
            {[1, 2].map((post) => (
                <div key={post} className="bg-white rounded-xl p-5 shadow-card">
                    <div className="flex items-center gap-3 mb-4">
                        <img
                            src={`https://randomuser.me/api/portraits/women/${post + 20}.jpg`}
                            alt="User"
                            className="w-[40px] h-[40px] rounded-full object-cover"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-text-main">ana_sleep</span>
                            <span className="text-xs text-text-secondary">5 horas atrás</span>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-text-main mb-2">Sonho Lúcido na Floresta</h3>
                    <p className="text-text-secondary text-sm leading-relaxed mb-4">
                        Hoje tive um sonho incrível onde eu conseguia controlar tudo ao meu redor.
                        As árvores mudavam de cor conforme eu tocava nelas...
                    </p>

                    <div className="w-full h-[250px] bg-gray-200 rounded-lg mb-4 object-cover overflow-hidden">
                        <img src={`https://picsum.photos/seed/${post}/600/300`} alt="Dream" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex gap-2 mb-4">
                        <span className="text-xs text-accent-blue cursor-pointer hover:underline">#sonholucido</span>
                        <span className="text-xs text-accent-blue cursor-pointer hover:underline">#natureza</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Home;
