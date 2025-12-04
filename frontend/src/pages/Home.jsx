import React from 'react';
import { FaImage, FaSmile, FaMapMarkerAlt, FaMusic } from 'react-icons/fa';
import { MdGif } from 'react-icons/md';
import Post from '../components/Post';

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
            {[1, 2].map((postId) => (
                <Post
                    key={postId}
                    post={{
                        userName: "ana_sleep",
                        userImage: `https://randomuser.me/api/portraits/women/${postId + 20}.jpg`,
                        time: "5 horas atrás",
                        title: "Sonho Lúcido na Floresta",
                        content: "Hoje tive um sonho incrível onde eu conseguia controlar tudo ao meu redor. As árvores mudavam de cor conforme eu tocava nelas...",
                        image: `https://picsum.photos/seed/${postId}/600/300`,
                        tags: ["#sonholucido", "#natureza"]
                    }}
                />
            ))}
        </div>
    );
};

export default Home;
