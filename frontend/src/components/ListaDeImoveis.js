import React from 'react';
import './ListaDeImoveis.css';
import { Link } from 'react-router-dom'; // Importe Link

function ListaDeImoveis({ imoveis }) {
  if (!imoveis || imoveis.length === 0) {
    return <p>Nenhum imóvel encontrado para sua busca.</p>;
  }

  return (
    <div className="lista-de-imoveis">
      {imoveis.map(imovel => (
        <div key={imovel.id} className="card-imovel">
            <img
            src={imovel.fotos && imovel.fotos.length > 0 ? `http://localhost:3000${imovel.fotos[0]}` || '/img/imagem-padrao.jpg' : '/img/imagem-padrao.jpg'}
              alt={imovel.titulo || 'Imagem do Imóvel'}
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

export default ListaDeImoveis;
