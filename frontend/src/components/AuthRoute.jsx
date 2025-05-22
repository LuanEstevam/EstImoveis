// src/components/AuthRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Este componente não precisa mais da prop 'isLoggedIn' do App.js
function AuthRoute({ children }) {
  // Verifica se existe um token no localStorage (indicativo de que o usuário está logado)
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (!isAuthenticated) {
    // Se não estiver autenticado, redireciona para a página de login administrativa
    return <Navigate to="/admin/login" replace />;
  }

  // Se estiver autenticado, renderiza os componentes filhos (AdminLayout, neste caso)
  // Ou o Outlet para rotas aninhadas
  return children ? children : <Outlet />;
}

export default AuthRoute;
