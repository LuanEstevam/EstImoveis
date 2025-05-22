import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './DetalheImovel.css';
import Carrossel from './Carrossel';

function DetalheImovel() {
  const { id } = useParams();
  const [imovel, setImovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/imoveis/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro ao buscar detalhes do imóvel: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setImovel(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p>Carregando detalhes do imóvel...</p>;
  }

  if (error) {
    return <p>Erro ao carregar detalhes do imóvel: {error.message}</p>;
  }

  if (!imovel) {
    return <p>Imóvel não encontrado.</p>;
  }

  return (
    <div className="detalhe-imovel">
          <h2>{imovel.titulo}</h2>
          <p className="preco">
            {imovel.preco ? `R$ ${parseFloat(imovel.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Preço Sob Consulta'}
          </p>
          <p>Tipo: {imovel.tipo}</p>
          <p>Endereço: {imovel.endereco}, {imovel.bairro}, {imovel.cidade}</p>
          <p>Quartos: {imovel.quartos}</p>
          <p>Banheiros: {imovel.banheiros}</p>
          <p>Vagas: {imovel.vagas}</p>
          <p>Área Útil: {imovel.area_util} m²</p>
          <p>Área Total: {imovel.area_total} m²</p>
          <p>Descrição: {imovel.descricao}</p>
          {imovel.fotos && imovel.fotos.length > 0 ? (
            <>
              {console.log("Conteúdo de imovel.fotos:", imovel.fotos)} {/* ADICIONE ESTE LOG */}
              <Carrossel fotos={imovel.fotos.map(foto => `http://localhost:3000${foto}`)} />
            </>
          ) : (
            <img src="/img/imagem-padrao.jpg" alt="Sem fotos" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginTop: '15px' }} />
          )}
          {/* Mais detalhes */}
        </div>
      );
}

export default DetalheImovel;
