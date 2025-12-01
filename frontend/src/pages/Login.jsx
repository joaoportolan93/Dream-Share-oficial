import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        identifier: '', // Username or Email
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login/', {
                email: credentials.identifier,
                password: credentials.password
            });

            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            navigate('/profile');
        } catch (error) {
            console.error('Login failed:', error);
            alert('Falha no login. Verifique suas credenciais.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] font-sans text-white">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-10 rounded-2xl w-full max-w-md shadow-2xl text-center">
                <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-[#c471ed] to-[#f64f59] bg-clip-text text-transparent">
                    Dream Share
                </h1>
                <p className="mb-8 text-gray-400 text-sm">
                    Entre no mundo dos sonhos
                </p>

                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    <div className="flex flex-col items-start">
                        <label htmlFor="identifier" className="mb-2 text-xs text-gray-300">
                            Usuário ou Email
                        </label>
                        <input
                            type="text"
                            id="identifier"
                            name="identifier"
                            className="w-full px-3 py-3 rounded-lg border border-white/20 bg-black/20 text-white text-base transition-colors focus:outline-none focus:border-[#c471ed]"
                            placeholder="Digite seu usuário ou email"
                            value={credentials.identifier}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex flex-col items-start">
                        <label htmlFor="password" className="mb-2 text-xs text-gray-300">
                            Senha
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full px-3 py-3 rounded-lg border border-white/20 bg-black/20 text-white text-base transition-colors focus:outline-none focus:border-[#c471ed]"
                            placeholder="Digite sua senha"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-3 rounded-lg border-none bg-gradient-to-r from-[#654ea3] to-[#eaafc8] text-white text-base font-semibold cursor-pointer transition-all hover:opacity-90 hover:-translate-y-0.5"
                    >
                        Entrar
                    </button>
                </form>

                <div className="mt-6 text-xs text-gray-400">
                    Ainda não tem uma conta?
                    <a href="/register" className="text-[#eaafc8] no-underline ml-1 hover:underline">
                        Cadastre-se
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;
