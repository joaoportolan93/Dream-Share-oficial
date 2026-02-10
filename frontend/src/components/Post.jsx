import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaRetweet, FaShare, FaBookmark, FaRegBookmark, FaEllipsisH, FaUserPlus, FaBan, FaVolumeMute, FaFlag } from 'react-icons/fa';

const Post = ({ post }) => {
    const [liked, setLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([
        { id: 1, user: 'joao_dreamer', text: 'Incrível! Também tive um sonho assim.' },
        { id: 2, user: 'lucid_master', text: 'As cores eram vivas?' }
    ]);
    const [newComment, setNewComment] = useState('');

    const handleLike = () => {
        setLiked(!liked);
    };

    const handleCommentToggle = () => {
        setShowComments(!showComments);
    };

    const handleAddComment = (e) => {
        if (e.key === 'Enter' && newComment.trim()) {
            setComments([...comments, { id: Date.now(), user: 'voce', text: newComment }]);
            setNewComment('');
        }
    };

    const handleRepost = () => {
        alert('Post repostado com sucesso!');
    };

    const [saved, setSaved] = useState(false);

    const [showMenu, setShowMenu] = useState(false);

    const handleSave = () => {
        setSaved(!saved);
    };

    return (
        <div className="bg-white dark:bg-white/5 dark:backdrop-blur-sm rounded-xl p-5 shadow-card dark:shadow-none mb-6 relative">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <img
                        src={post.userImage}
                        alt="User"
                        className="w-[40px] h-[40px] rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-main dark:text-white">{post.userName}</span>
                        <span className="text-xs text-text-secondary dark:text-gray-400">{post.time}</span>
                    </div>
                </div>

                {/* Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <FaEllipsisH className="text-gray-500 dark:text-gray-400" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-20 min-w-[200px] overflow-hidden">
                            <button
                                onClick={() => { alert('Seguir usuário'); setShowMenu(false); }}
                                className="w-full flex items-center gap-2 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-sm"
                            >
                                <FaUserPlus /> Seguir @{post.userName || 'usuario'}
                            </button>
                            <button
                                onClick={() => { alert('Silenciar usuário'); setShowMenu(false); }}
                                className="w-full flex items-center gap-2 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-sm"
                            >
                                <FaVolumeMute /> Silenciar
                            </button>
                            <button
                                onClick={() => { alert('Bloquear usuário'); setShowMenu(false); }}
                                className="w-full flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                            >
                                <FaBan /> Bloquear @{post.userName || 'usuario'}
                            </button>
                            <button
                                onClick={() => { alert('Denunciar post'); setShowMenu(false); }}
                                className="w-full flex items-center gap-2 px-4 py-3 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-sm"
                            >
                                <FaFlag /> Denunciar post
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">{post.title}</h3>
            <p className="text-text-secondary dark:text-gray-300 text-sm leading-relaxed mb-4">
                {post.content}
            </p>

            <div className="w-full h-[250px] bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 object-cover overflow-hidden">
                <img src={post.image} alt="Dream" className="w-full h-full object-cover" />
            </div>

            <div className="flex gap-2 mb-4">
                {post.tags.map((tag, index) => (
                    <span key={index} className="text-xs text-accent-blue cursor-pointer hover:underline">
                        {tag}
                    </span>
                ))}
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border dark:border-white/10 mt-4">
                <div className="flex gap-6">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${liked ? 'text-red-500' : 'text-text-secondary dark:text-gray-400 hover:text-red-500'}`}
                    >
                        {liked ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                        <span>{liked ? 'Curtido' : 'Curtir'}</span>
                    </button>

                    <button
                        onClick={handleCommentToggle}
                        className="flex items-center gap-2 text-sm font-medium text-text-secondary dark:text-gray-400 hover:text-primary transition-colors"
                    >
                        <FaComment size={20} />
                        <span>Comentar</span>
                    </button>

                    <button
                        onClick={handleRepost}
                        className="flex items-center gap-2 text-sm font-medium text-text-secondary dark:text-gray-400 hover:text-green-500 transition-colors"
                    >
                        <FaRetweet size={20} />
                        <span>Repostar</span>
                    </button>
                </div>

                <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${saved ? 'text-primary' : 'text-text-secondary dark:text-gray-400 hover:text-primary'}`}
                >
                    {saved ? <FaBookmark size={20} /> : <FaRegBookmark size={20} />}
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-border dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg p-4">
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Escreva um comentário..."
                            className="w-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full px-4 py-2 text-sm text-text-main dark:text-white focus:outline-none focus:border-primary dark:placeholder-gray-400"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={handleAddComment}
                        />
                    </div>
                    <div className="space-y-3">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2">
                                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
                                <div className="bg-white dark:bg-white/10 p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-text-main dark:text-gray-200">
                                    <span className="font-bold block text-xs mb-1 text-text-main dark:text-white">{comment.user}</span>
                                    {comment.text}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Post;
