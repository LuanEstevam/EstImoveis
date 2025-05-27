// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes da parte pública (frontend)
import DestaquesHome from './components/DestaquesHome';
import FormularioBusca from './components/FormularioBusca';
import MenuPrincipal from './components/MenuPrincipal';
import ListaDeImoveis from './components/ListaDeImoveis';
import DetalheImovel from './components/DetalheImovel';
import FormularioAnuncio from './components/FormularioAnuncio'; // Rota pública para "Anunciar"
import Contato from './components/Contato';
import WhatsAppButton from './components/WhatsAppButton';
import PaginaBuscar from './components/PaginaBuscar'; // Importação do componente PaginaBuscar
import Home from './components/Home.jsx'; // Importe o componente Home

// Componentes da área administrativa e autenticação
import AdminLayout from './components/admin/AdminLayout.jsx';
import AdminImoveisList from './components/admin/AdminImoveisList.jsx';
import AdminImovelEditForm from './components/admin/imoveis/editar/AdminImovelEditForm.jsx';
import AdminDashBoard from './components/admin/AdminDashBoard.jsx'; // Importar o Dashboard
import AdminContatosList from './components/admin/AdminContatosList.jsx'; // Importar a lista de contatos
import AdminAnunciarImovel from './components/admin/AdminAnunciarImovel.jsx'; // Componente para anunciar imóvel na área admin
import LoginPage from './components/admin/LoginPage.jsx'; // Componente de login para admin

// Componente para rotas protegidas (AuthRoute)
import AuthRoute from './components/AuthRoute.jsx';

import './style.css'; // Seu CSS global

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Verifica o token no localStorage ao carregar a aplicação
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // A navegação real após o logout será tratada no MenuPrincipal ou AdminLayout
  };

  return (
    <Router>
      <div>
        {/* Passa o estado de login e a função de logout para o MenuPrincipal */}
        <MenuPrincipal isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        <main className="container">
          <Routes>
            {/* Rota de Login para a Área Administrativa */}
            <Route path="/admin/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />

            {/* Rotas Administrativas (Protegidas pelo AuthRoute) */}
            <Route path="/admin" element={
              <AuthRoute>
                <AdminLayout />
              </AuthRoute>
            }>
              <Route index element={<AdminDashBoard />} />
              <Route path="imoveis" element={<AdminImoveisList />} />
              <Route path="imoveis/anunciar" element={<AdminAnunciarImovel />} />
              <Route path="imoveis/editar/:id" element={<AdminImovelEditForm />} />
              <Route path="contatos" element={<AdminContatosList />} />
              {/* Adicione outras rotas de admin aqui, se houver */}
            </Route>

            {/* Suas Rotas Públicas */}
            <Route path="/" element={<Home />} />
            
            {/* A rota /imoveis agora renderiza o PaginaBuscar, que inclui o formulário de busca e a lista */}
            <Route path="/imoveis" element={<PaginaBuscar />} /> 
            
            {/* Você pode manter ou remover a rota /buscar. Se /imoveis já faz o que você quer, ela é opcional. */}
            {/* <Route path="/buscar" element={<PaginaBuscar />} /> */} 

            <Route path="/imovel/:id" element={<DetalheImovel />} />
            <Route path="/anunciar" element={<FormularioAnuncio />} />
            <Route path="/contato" element={<Contato />} />
          </Routes>
        </main>
        <footer>
          <div className="container">
            <p>&copy; {new Date().getFullYear()} Sua Imobiliária</p>
          </div>
        </footer>
        <WhatsAppButton />
      </div>
    </Router>
  );
}

export default App;