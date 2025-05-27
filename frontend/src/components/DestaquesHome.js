import React, { useState, useEffect } from 'react';
import './ListaDeImoveis.css';
import { Link } from 'react-router-dom'; // Importe Link

function DestaquesHome() {
  const [destaques, setDestaques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/destaques-home')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setDestaques(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Carregando destaques...</p>;
  }

  if (error) {
    return <p>Erro ao carregar destaques: {error.message}</p>;
  }

  return (
    <div className="lista-destaques">
      <h2>Destaques</h2>
      {destaques.map(imovel => (
        <div key={imovel.id} className="card-imovel">
        <img
        src={imovel.fotos && imovel.fotos.length > 0 ? `http://localhost:3000${imovel.fotos[0]}` || '/img/imagem-padrao.jpg' : '/img/imagem-padrao.jpg'}
        alt={imovel.titulo || 'Imagem do Destaque'}
        />
          <div className="info-imovel">
            <h3>{imovel.titulo || 'Título Indisponível'}</h3>
            <p className="preco">
              {imovel.preco ? `R$ ${parseFloat(imovel.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Preço Sob Consulta'}
            </p>
            <Link to={`/imovel/${imovel.id}`} className="ver-detalhes"> {/* Use Link aqui */}
              Ver Detalhes
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DestaquesHome;
