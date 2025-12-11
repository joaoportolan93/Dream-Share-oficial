import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaSave, FaArrowLeft } from 'react-icons/fa';
import { getProfile, updateUser, uploadAvatar } from '../services/api';

const EditProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        nome_completo: '',
        bio: '',
        data_nascimento: '',
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getProfile();
                setUser(response.data);
                setFormData({
                    nome_completo: response.data.nome_completo || '',
                    nome_usuario: response.data.nome_usuario || '',
                    bio: response.data.bio || '',
                    data_nascimento: response.data.data_nascimento || '',
                });
                setAvatarPreview(response.data.avatar_url);
            } catch (err) {
                setError('Erro ao carregar perfil');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // Upload avatar if changed
            if (avatarFile) {
                await uploadAvatar(avatarFile);
            }

            // Update profile data
            await updateUser(user.id_usuario, formData);

            setSuccess('Perfil atualizado com sucesso!');
            setTimeout(() => navigate('/profile'), 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao atualizar perfil');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                    <FaArrowLeft className="text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Editar Perfil
                </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex justify-center">
                    <div className="relative">
                        <img
                            src={avatarPreview || 'https://randomuser.me/api/portraits/women/44.jpg'}
                            alt="Avatar"
                            className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                        />
                        <label className="absolute bottom-0 right-0 p-3 bg-primary rounded-full cursor-pointer hover:bg-primary/80 transition-colors">
                            <FaCamera className="text-white" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                        {success}
                    </div>
                )}

                {/* Username */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome de usuário
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                        <input
                            type="text"
                            name="nome_usuario"
                            value={formData.nome_usuario}
                            onChange={handleInputChange}
                            className="w-full pl-8 pr-4 py-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all"
                            placeholder="username"
                        />
                    </div>
                </div>

                {/* Full Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome completo
                    </label>
                    <input
                        type="text"
                        name="nome_completo"
                        value={formData.nome_completo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all"
                        placeholder="Seu nome completo"
                    />
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                    </label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all resize-none"
                        placeholder="Conte um pouco sobre você e seus sonhos..."
                    />
                </div>

                {/* Birth Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Data de nascimento
                    </label>
                    <input
                        type="date"
                        name="data_nascimento"
                        value={formData.data_nascimento}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            Salvando...
                        </>
                    ) : (
                        <>
                            <FaSave />
                            Salvar Alterações
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default EditProfile;
