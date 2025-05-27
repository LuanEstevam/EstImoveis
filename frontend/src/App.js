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

// --- Componente PaginaBuscar (Pode ser movido para um arquivo separado) ---
function PaginaBuscar() {
  const [resultadosBusca, setResultadosBusca] = useState([]);

  const handleBuscar = (filtros) => {
    console.log('Realizando busca com filtros:', filtros);
    const { termo, quartos, banheiros, vagas, cidade, bairro, precoMin, precoMax, tipoNegocio } = filtros;

    // ALERTA: Ajuste esta URL para a porta correta do seu backend
    // Idealmente, use um proxy no package.json do frontend e use URL relativa `/api/buscar`
    // Exemplo com proxy configurado (RECOMENDADO):
    let url = `/api/buscar?q=${termo || ''}`;
    // Exemplo sem proxy (SE O BACKEND RODA NA PORTA 5000):
    // let url = `http://localhost:5000/api/buscar?q=${termo || ''}`;

    if (quartos) url += `&quartos=${quartos}`;
    if (banheiros) url += `&banheiros=${banheiros}`;
    if (vagas) url += `&vagas=${vagas}`;
    if (cidade) url += `&cidade=${cidade}`;
    if (bairro) url += `&bairro=${bairro}`;
    if (precoMin) url += `&precoMin=${precoMin}`;
    if (precoMax) url += `&precoMax=${precoMax}`;
    if (tipoNegocio) url += `&tipoNegocio=${tipoNegocio}`;

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro na busca: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setResultadosBusca(data);
        console.log('Resultados da busca:', data);
      })
      .catch(error => {
        console.error('Erro ao buscar imóveis:', error);
        setResultadosBusca([]);
      });
  };

  return (
    <div className="pagina-buscar">
      <h2>Buscar Imóveis</h2>
      <FormularioBusca onBuscar={handleBuscar} />
      {resultadosBusca.length > 0 && (
        <section id="resultados-busca">
          <h3>Resultados da Busca</h3>
          <ListaDeImoveis imoveis={resultadosBusca} />
        </section>
      )}
      {resultadosBusca.length === 0 && resultadosBusca !== null && (
        <p>Nenhum imóvel encontrado para sua busca.</p>
      )}
    </div>
  );
}
// --- Fim do Componente PaginaBuscar ---

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
            {/* O AuthRoute encapsula as rotas que requerem autenticação */}
            <Route path="/admin" element={
              <AuthRoute> {/* AuthRoute verifica o token, não precisa de isLoggedIn aqui */}
                <AdminLayout /> {/* AdminLayout renderiza o cabeçalho/menu admin e um <Outlet /> para as rotas aninhadas */}
              </AuthRoute>
            }>
              {/* Rotas Aninhadas dentro de /admin */}
              <Route index element={<AdminDashBoard />} /> {/* /admin (dashboard principal) */}
              <Route path="imoveis" element={<AdminImoveisList />} /> {/* /admin/imoveis (lista de imóveis) */}
              <Route path="imoveis/anunciar" element={<AdminAnunciarImovel />} /> {/* /admin/imoveis/anunciar (NOVA ROTA) */}
              <Route path="imoveis/editar/:id" element={<AdminImovelEditForm />} /> {/* /admin/imoveis/editar/:id (editar imóvel) */}
              <Route path="contatos" element={<AdminContatosList />} /> {/* /admin/contatos (lista de contatos) */}
              {/* Adicione outras rotas de admin aqui, se houver */}
            </Route>

            {/* Suas Rotas Públicas Existentes */}
            {/* A rota raiz "/" agora usa o componente Home */}
            <Route path="/" element={<Home />} />
            
            <Route path="/buscar" element={<PaginaBuscar />} />
            <Route path="/imovel/:id" element={<DetalheImovel />} />
            <Route path="/anunciar" element={<FormularioAnuncio />} /> {/* Formulário de anúncio público */}
            <Route path="/contato" element={<Contato />} />
            <Route path="/imoveis" element={<ListaDeImoveis />} />
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