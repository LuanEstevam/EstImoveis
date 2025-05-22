import React, { useState, useEffect } from 'react';
import DestaquesHome from './components/DestaquesHome';
import FormularioBusca from './components/FormularioBusca';
import MenuPrincipal from './components/MenuPrincipal';
import ListaDeImoveis from './components/ListaDeImoveis';
import DetalheImovel from './components/DetalheImovel';
import FormularioAnuncio from './components/FormularioAnuncio';
import Contato from './components/Contato';
import WhatsAppButton from './components/WhatsAppButton';
// Importe useNavigate apenas onde for realmente usado (ex: MenuPrincipal, LoginPage)
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import AdminImoveisList from './components/admin/AdminImoveisList.jsx';
import AdminImovelEditForm from './components/admin/imoveis/editar/AdminImovelEditForm.jsx';
import LoginPage from './components/admin/LoginPage.jsx';
import AuthRoute from './components/AuthRoute.jsx';
import './style.css'; // Ou o caminho correto para o seu CSS global

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // A navegação real após o logout será tratada no MenuPrincipal
  };

  return (
    <Router>
      <div>
        <MenuPrincipal isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        <main className="container">
          <Routes>
            {/* Rota para a página de Login */}
            <Route path="/admin/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />

            {/* Rotas de Administração Protegidas */}
            <Route path="/admin" element={
              <AuthRoute isLoggedIn={isLoggedIn}>
                <AdminLayout />
              </AuthRoute>
            }>
              <Route path="imoveis" element={<AdminImoveisList />} />
              <Route path="imoveis/editar/:id" element={<AdminImovelEditForm />} />
              {/* Adicione outras rotas de admin aqui, se houver */}
            </Route>

            {/* Suas Rotas Públicas Existentes */}
            <Route path="/" element={<>
              <section id="banner-principal">
                <div className="banner-content">
                  <h2>Encontre o Imóvel Ideal para Você!</h2>
                </div>
              </section>
              <section id="sobre-nos">
                <h2>Sobre Nós</h2>
                <p>Aqui você pode inserir uma breve descrição da sua imobiliária, seus valores e diferenciais.</p>
              </section>
              <section id="destaques-react">
                <DestaquesHome />
              </section>
            </>} />
            <Route path="/buscar" element={<PaginaBuscar />} />
            <Route path="/imovel/:id" element={<DetalheImovel />} />
            <Route path="/anunciar" element={<FormularioAnuncio />} />
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

// Seu componente PaginaBuscar existente (não precisa de useNavigate aqui)
function PaginaBuscar() {
  const [resultadosBusca, setResultadosBusca] = useState([]);

  const handleBuscar = (filtros) => {
    console.log('Realizando busca com filtros:', filtros);
    const { termo, quartos, banheiros, vagas, cidade, bairro, precoMin, precoMax, tipoNegocio } = filtros;

    let url = `http://localhost:3000/api/buscar?q=${termo || ''}`; // URL completa para o backend
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

export default App;
