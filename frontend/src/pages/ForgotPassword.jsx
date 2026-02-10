import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Auth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (newPassword.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);

        try {
            await axios.post('http://127.0.0.1:8000/api/auth/password-reset/', {
                email,
                nome_usuario: nomeUsuario,
                new_password: newPassword,
            });
            setSuccess(true);
        } catch (err) {
            if (err.response?.data?.non_field_errors) {
                setError(err.response.data.non_field_errors[0]);
            } else if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Não foi possível redefinir a senha. Verifique seus dados e tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg">
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="auth-title">DreamShare</h1>

                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="auth-success">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block' }}>
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <h2 style={{ color: '#f8fafc', fontSize: '1.3rem', marginBottom: '8px', textAlign: 'center' }}>
                                    Senha redefinida!
                                </h2>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', marginBottom: '24px' }}>
                                    Sua senha foi alterada com sucesso. Agora você pode entrar com a nova senha.
                                </p>
                                <button
                                    className="btn-dream"
                                    onClick={() => navigate('/login')}
                                >
                                    Ir para o Login
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p className="auth-subtitle">
                                Informe seu email e nome de usuário para redefinir sua senha
                            </p>

                            {error && (
                                <motion.div
                                    className="auth-error"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleReset}>
                                <input
                                    type="email"
                                    className="auth-input"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    className="auth-input"
                                    placeholder="Nome de usuário"
                                    value={nomeUsuario}
                                    onChange={(e) => setNomeUsuario(e.target.value)}
                                    required
                                />
                                <input
                                    type="password"
                                    className="auth-input"
                                    placeholder="Nova senha"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <input
                                    type="password"
                                    className="auth-input"
                                    placeholder="Confirmar nova senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="btn-dream"
                                    disabled={loading}
                                >
                                    {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                                </button>
                            </form>

                            <p className="auth-link">
                                Lembrou a senha? <Link to="/login">Voltar ao login</Link>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
