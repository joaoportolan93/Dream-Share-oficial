import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaRetweet, FaShare, FaBookmark, FaRegBookmark } from 'react-icons/fa';

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

    const handleSave = () => {
        setSaved(!saved);
    };

    return (
        <div className="bg-white rounded-xl p-5 shadow-card mb-6">
            <div className="flex items-center gap-3 mb-4">
                <img
                    src={post.userImage}
                    alt="User"
                    className="w-[40px] h-[40px] rounded-full object-cover"
                />
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-main">{post.userName}</span>
                    <span className="text-xs text-text-secondary">{post.time}</span>
                </div>
            </div>

            <h3 className="text-lg font-bold text-text-main mb-2">{post.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
                {post.content}
            </p>

            <div className="w-full h-[250px] bg-gray-200 rounded-lg mb-4 object-cover overflow-hidden">
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
            <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                <div className="flex gap-6">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${liked ? 'text-red-500' : 'text-text-secondary hover:text-red-500'}`}
                    >
                        {liked ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                        <span>{liked ? 'Curtido' : 'Curtir'}</span>
                    </button>

                    <button
                        onClick={handleCommentToggle}
                        className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
                    >
                        <FaComment size={20} />
                        <span>Comentar</span>
                    </button>

                    <button
                        onClick={handleRepost}
                        className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-green-500 transition-colors"
                    >
                        <FaRetweet size={20} />
                        <span>Repostar</span>
                    </button>
                </div>

                <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${saved ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
                >
                    {saved ? <FaBookmark size={20} /> : <FaRegBookmark size={20} />}
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-border bg-gray-50 rounded-lg p-4">
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Escreva um comentário..."
                            className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={handleAddComment}
                        />
                    </div>
                    <div className="space-y-3">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm">
                                    <span className="font-bold block text-xs mb-1">{comment.user}</span>
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
