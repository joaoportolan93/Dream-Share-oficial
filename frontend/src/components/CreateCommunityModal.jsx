import React, { useState } from 'react';
import { FaTimes, FaCamera, FaImage } from 'react-icons/fa';

const CreateCommunityModal = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validation could go here
        onCreate({ name, description, image: image });
        onClose();
        // Reset form
        setName('');
        setDescription('');
        setImage(null);
        setImagePreview(null);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-4xl bg-white dark:bg-[#1a1b1e] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10"
                >
                    <FaTimes size={20} />
                </button>

                {/* Left Side: Form */}
                <div className="w-full md:w-3/5 p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Conte-nos sobre sua comunidade
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                        O nome e a descrição ajudam as pessoas a saber do que se trata sua comunidade.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nome da comunidade <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={21}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#272729] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="Ex: SonhosLucidos"
                                required
                            />
                            <p className="text-right text-xs text-gray-400 mt-1">
                                {name.length}/21
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Descrição <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#272729] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none h-32"
                                placeholder="Descreva sua comunidade..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Imagem da Comunidade
                            </label>
                            <div className="mt-1 flex items-center gap-4">
                                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#272729] hover:bg-gray-200 dark:hover:bg-[#323336] text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                                    <FaCamera />
                                    <span>Escolher Imagem</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                                <span className="text-xs text-gray-400">
                                    {image ? image.name : 'Nenhum arquivo selecionado'}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-full text-sm font-bold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!name || !description}
                                className="px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary/25"
                            >
                                Criar Comunidade
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Side: Preview */}
                <div className="hidden md:block w-2/5 bg-gray-50 dark:bg-[#272729] p-8 border-l border-gray-200 dark:border-white/5">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">
                        Pré-visualização
                    </h3>

                    <div className="bg-white dark:bg-[#1a1b1e] rounded-xl overflow-hidden shadow-card border border-gray-200 dark:border-white/5">
                        <div className="h-20 bg-primary/10 relative">
                            {/* Banner mock */}
                            <div className="absolute -bottom-6 left-4 border-4 border-white dark:border-[#1a1b1e] rounded-xl overflow-hidden bg-white dark:bg-[#272729] w-16 h-16 flex items-center justify-center">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-bold text-primary">
                                        {name ? name.charAt(0).toUpperCase() : '?'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="pt-8 p-4">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                                {name || 'Nome da Comunidade'}
                            </h4>
                            <p className="text-xs text-gray-500 mb-3">
                                1 membro • 1 online
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 break-words">
                                {description || 'Descrição da sua comunidade aparecerá aqui...'}
                            </p>

                            <div className="mt-4 flex gap-2">
                                <button className="flex-1 py-1.5 rounded-full text-xs font-bold bg-primary text-white">
                                    Entrar
                                </button>
                                <button className="flex-1 py-1.5 rounded-full text-xs font-bold border border-primary text-primary">
                                    Visitar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCommunityModal;
