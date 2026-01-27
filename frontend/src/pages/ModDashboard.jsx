import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCommunity, getCommunityStats } from '../services/api';
import { FaUsers, FaChartLine, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

const ModDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [community, setCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [commResponse, statsResponse] = await Promise.all([
                getCommunity(id),
                getCommunityStats(id)
            ]);
            setCommunity(commResponse.data);
            setStats(statsResponse.data);
        } catch (err) {
            console.error('Error loading stats:', err);
            setError(err.response?.data?.error || 'Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Acesso Negado</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button onClick={() => navigate(`/community/${id}`)} className="text-primary hover:underline">
                Voltar para Comunidade
            </button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => navigate(`/communities/${id}`)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                    <FaArrowLeft />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Painel de Moderação: {community.nome}
                </h1>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Membros Totais"
                    value={stats.total_members}
                    change={`+${stats.new_members_last_7_days} esta semana`}
                    icon={<FaUsers />}
                    color="blue"
                />
                <StatCard
                    title="Engajamento (Posts)"
                    value={stats.total_posts}
                    change={`+${stats.posts_last_7_days} esta semana`}
                    icon={<FaChartLine />}
                    color="green"
                />
                <StatCard
                    title="Relatórios Pendentes"
                    value={stats.pending_reports}
                    change="Ação necessária"
                    icon={<FaExclamationTriangle />}
                    color="red"
                />
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-cosmic-card p-6 rounded-xl shadow-card dark:shadow-none border border-border dark:border-white/10">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Crescimento</h3>
                    <div className="space-y-4">
                        <StatRow label="Novos membros (7 dias)" value={stats.new_members_last_7_days} />
                        <StatRow label="Novos membros (30 dias)" value={stats.new_members_last_30_days} />
                        <StatRow label="Membros Ativos (7 dias)" value={stats.active_members_last_7_days} />
                    </div>
                </div>

                <div className="bg-white dark:bg-cosmic-card p-6 rounded-xl shadow-card dark:shadow-none border border-border dark:border-white/10">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Atividade Recente</h3>
                    <div className="text-sm text-gray-500 text-center py-8">
                        Gráficos detalhados em breve...
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, change, icon, color }) => {
    const colors = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        red: 'bg-red-500',
    };

    return (
        <div className="bg-white dark:bg-cosmic-card p-6 rounded-xl shadow-card dark:shadow-none border border-border dark:border-white/10">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${colors[color]} bg-opacity-10 text-${color}-500`}>
                    {React.cloneElement(icon, { className: `text-${color}-500 text-xl` })}
                </div>
            </div>
            <p className="text-xs text-gray-500">
                <span className="font-medium text-green-500">{change}</span>
            </p>
        </div>
    );
};

const StatRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-bold text-gray-900 dark:text-white">{value}</span>
    </div>
);

export default ModDashboard;
