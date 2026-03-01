import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, login } from '../services/api';
import { motion } from 'framer-motion';
import '../styles/Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        pergunta_secreta: '',
        resposta_secreta: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const perguntasSecretas = [
        { id: 1, text: 'Qual o nome do seu primeiro animal de estimação?' },
        { id: 2, text: 'Qual o nome da sua cidade natal?' },
        { id: 3, text: 'Qual era o nome da sua escola primária?' },
        { id: 4, text: 'Qual o nome do seu melhor amigo de infância?' },
        { id: 5, text: 'Qual o modelo do seu primeiro carro?' },
    ];

    const getPerguntaText = (id) => {
        const p = perguntasSecretas.find(p => p.id === Number(id));
        return p ? p.text : 'Selecione uma pergunta secreta';
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSelectPergunta = (id) => {
        setFormData({
            ...formData,
            pergunta_secreta: id,
        });
        setIsDropdownOpen(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // Validate secret question
        if (!formData.pergunta_secreta) {
            setError('Por favor, selecione uma pergunta secreta.');
            return;
        }

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
            await register({
                nome_usuario: formData.username,
                email: formData.email,
                nome_completo: formData.username,
                password: formData.password,
                pergunta_secreta: formData.pergunta_secreta ? Number(formData.pergunta_secreta) : undefined,
                resposta_secreta: formData.resposta_secreta || undefined,
            });

            // Auto-login after registration
            const loginResponse = await login({
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

                    {/* Custom Dropdown */}
                    <div className="custom-select-container">
                        <div
                            className={`custom-select-trigger ${isDropdownOpen ? 'open' : ''}`}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span>{getPerguntaText(formData.pergunta_secreta)}</span>
                            <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
                        </div>

                        {isDropdownOpen && (
                            <motion.div
                                className="custom-select-options"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {perguntasSecretas.map((p) => (
                                    <div
                                        key={p.id}
                                        className={`custom-option ${Number(formData.pergunta_secreta) === p.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectPergunta(p.id)}
                                    >
                                        {p.text}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                    <input
                        type="text"
                        name="resposta_secreta"
                        className="auth-input"
                        placeholder="Resposta secreta"
                        value={formData.resposta_secreta}
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
