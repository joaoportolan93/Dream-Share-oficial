import React from 'react';
import Post from '../components/Post';

const Saved = () => {
    // Dummy data for saved posts
    const savedPosts = [
        {
            id: 1,
            userName: "ana_sleep",
            userImage: "https://randomuser.me/api/portraits/women/21.jpg",
            time: "2 dias atrás",
            title: "Sonho Lúcido na Floresta",
            content: "Hoje tive um sonho incrível onde eu conseguia controlar tudo ao meu redor. As árvores mudavam de cor conforme eu tocava nelas...",
            image: "https://picsum.photos/seed/1/600/300",
            tags: ["#sonholucido", "#natureza"]
        },
        {
            id: 3,
            userName: "carlos_dreamer",
            userImage: "https://randomuser.me/api/portraits/men/45.jpg",
            time: "1 semana atrás",
            title: "Voando sobre a cidade",
            content: "A sensação de liberdade era indescritível. Eu podia ver cada detalhe dos prédios lá embaixo.",
            image: "https://picsum.photos/seed/3/600/300",
            tags: ["#voo", "#liberdade"]
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-primary mb-2">Salvos</h1>

            {savedPosts.length > 0 ? (
                savedPosts.map((post) => (
                    <Post key={post.id} post={post} />
                ))
            ) : (
                <div className="bg-white dark:bg-white/5 rounded-xl p-8 text-center shadow-card dark:shadow-none">
                    <p className="text-text-secondary dark:text-gray-400">Você ainda não salvou nenhum sonho.</p>
                </div>
            )}
        </div>
    );
};

export default Saved;
