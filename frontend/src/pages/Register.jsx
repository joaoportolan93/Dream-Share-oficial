import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import '../styles/Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);

        try {
            // Register the user
            await axios.post('http://127.0.0.1:8000/api/auth/register/', {
                nome_usuario: formData.username,
                email: formData.email,
                nome_completo: formData.username,
                password: formData.password,
            });

            // Auto-login after registration
            const loginResponse = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
                email: formData.email,
                password: formData.password,
            });

            // Store tokens
            localStorage.setItem('access', loginResponse.data.access);
            localStorage.setItem('refresh', loginResponse.data.refresh);

            // Redirect to onboarding
            navigate('/onboarding');
        } catch (err) {
            if (err.response?.data?.email) {
                setError('Este email já está em uso.');
            } else if (err.response?.data?.username) {
                setError('Este nome de usuário já está em uso.');
            } else if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Ocorreu um erro ao criar a conta. Tente novamente.');
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
                <h1 className="auth-title">Criar Conta</h1>
                <p className="auth-subtitle">Junte-se à comunidade de sonhadores</p>

                {error && (
                    <motion.div
                        className="auth-error"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        name="username"
                        className="auth-input"
                        placeholder="Nome de usuário"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        className="auth-input"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        className="auth-input"
                        placeholder="Senha"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        className="auth-input"
                        placeholder="Confirmar senha"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    <button
                        type="submit"
                        className="btn-dream"
                        disabled={loading}
                    >
                        {loading ? 'Criando conta...' : 'Criar conta'}
                    </button>
                </form>

                <p className="auth-link">
                    Já tem uma conta? <Link to="/login">Entrar</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
