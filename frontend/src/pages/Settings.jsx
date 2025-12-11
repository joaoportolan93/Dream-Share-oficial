import React, { useState } from 'react';
import { FaCog, FaBell, FaLock, FaPalette, FaUser, FaSave, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');

    // Settings state
    const [settings, setSettings] = useState({
        // Notifications
        notifyNewFollower: true,
        notifyComments: true,
        notifyLikes: true,
        notifyMessages: true,
        emailNotifications: false,
        // Privacy
        profilePublic: true,
        showBirthDate: false,
        allowMessages: true,
        // Appearance
        theme: 'dark',
        language: 'pt-BR',
    });

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSelectChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuccess('Configurações salvas com sucesso!');
        setSaving(false);
        setTimeout(() => setSuccess(''), 3000);
    };

    const ToggleSwitch = ({ enabled, onToggle }) => (
        <button
            onClick={onToggle}
            className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-gray-600'}`}
        >
            <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'left-7' : 'left-1'}`}
            />
        </button>
    );

    const SettingRow = ({ icon: Icon, label, description, children }) => (
        <div className="flex items-center justify-between py-4 border-b border-white/10">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Icon className="text-primary" />
                </div>
                <div>
                    <h3 className="font-medium text-white">{label}</h3>
                    {description && <p className="text-sm text-gray-400">{description}</p>}
                </div>
            </div>
            {children}
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <FaArrowLeft className="text-gray-300" />
                </button>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <FaCog className="text-primary" />
                    Configurações
                </h1>
            </div>

            {/* Success Message */}
            {success && (
                <div className="mb-6 p-4 bg-green-900/30 text-green-300 rounded-lg">
                    {success}
                </div>
            )}

            {/* Notifications Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FaBell className="text-primary" />
                    Notificações
                </h2>

                <SettingRow icon={FaUser} label="Novos seguidores" description="Receber notificação quando alguém seguir você">
                    <ToggleSwitch enabled={settings.notifyNewFollower} onToggle={() => handleToggle('notifyNewFollower')} />
                </SettingRow>

                <SettingRow icon={FaBell} label="Comentários" description="Notificar sobre comentários em seus sonhos">
                    <ToggleSwitch enabled={settings.notifyComments} onToggle={() => handleToggle('notifyComments')} />
                </SettingRow>

                <SettingRow icon={FaBell} label="Curtidas" description="Notificar sobre curtidas em seus sonhos">
                    <ToggleSwitch enabled={settings.notifyLikes} onToggle={() => handleToggle('notifyLikes')} />
                </SettingRow>

                <SettingRow icon={FaBell} label="Mensagens" description="Notificar sobre novas mensagens">
                    <ToggleSwitch enabled={settings.notifyMessages} onToggle={() => handleToggle('notifyMessages')} />
                </SettingRow>

                <SettingRow icon={FaBell} label="Notificações por email" description="Receber resumo semanal por email">
                    <ToggleSwitch enabled={settings.emailNotifications} onToggle={() => handleToggle('emailNotifications')} />
                </SettingRow>
            </div>

            {/* Privacy Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FaLock className="text-primary" />
                    Privacidade
                </h2>

                <SettingRow icon={FaUser} label="Perfil público" description="Qualquer pessoa pode ver seu perfil">
                    <ToggleSwitch enabled={settings.profilePublic} onToggle={() => handleToggle('profilePublic')} />
                </SettingRow>

                <SettingRow icon={FaUser} label="Mostrar data de nascimento" description="Exibir sua idade no perfil">
                    <ToggleSwitch enabled={settings.showBirthDate} onToggle={() => handleToggle('showBirthDate')} />
                </SettingRow>

                <SettingRow icon={FaBell} label="Permitir mensagens" description="Receber mensagens de qualquer pessoa">
                    <ToggleSwitch enabled={settings.allowMessages} onToggle={() => handleToggle('allowMessages')} />
                </SettingRow>
            </div>

            {/* Appearance Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FaPalette className="text-primary" />
                    Aparência
                </h2>

                <SettingRow icon={FaPalette} label="Tema" description="Escolha o tema da interface">
                    <select
                        value={settings.theme}
                        onChange={(e) => handleSelectChange('theme', e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary"
                    >
                        <option value="dark">Escuro</option>
                        <option value="light">Claro</option>
                        <option value="system">Sistema</option>
                    </select>
                </SettingRow>

                <SettingRow icon={FaPalette} label="Idioma" description="Idioma da interface">
                    <select
                        value={settings.language}
                        onChange={(e) => handleSelectChange('language', e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary"
                    >
                        <option value="pt-BR">Português (BR)</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                    </select>
                </SettingRow>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
            >
                {saving ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        Salvando...
                    </>
                ) : (
                    <>
                        <FaSave />
                        Salvar Configurações
                    </>
                )}
            </button>
        </div>
    );
};

export default Settings;
