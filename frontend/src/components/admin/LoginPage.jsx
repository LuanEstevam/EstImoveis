// src/components/admin/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css'; // Crie este arquivo CSS para estilização

function LoginPage({ setIsLoggedIn }) { // Recebe setIsLoggedIn como prop
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpa qualquer erro anterior

    try {
      // ATENÇÃO: Ajuste esta URL para a rota de login do seu backend
      // Se seu backend está na porta 5000 e a rota é '/api/login', use 'http://localhost:5000/api/login'
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token); // Salva o token recebido do backend
        setIsLoggedIn(true); // Atualiza o estado de login no App.js
        navigate('/admin'); // Redireciona para a página principal da área administrativa
      } else {
        setError(data.message || 'Erro ao fazer login. Credenciais inválidas ou erro no servidor.');
      }
    } catch (err) {
      console.error('Erro de rede ou servidor:', err);
      setError('Não foi possível conectar ao servidor. Verifique sua conexão ou a URL do backend.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2>Login Administrativo</h2>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.formGroup}>
          <label htmlFor="username">Usuário:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>
        <button type="submit" className={styles.loginButton}>Entrar</button>
      </form>
    </div>
  );
}

export default LoginPage;
