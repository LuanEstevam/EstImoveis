// src/components/PaginaBuscar.js

import React, { useState, useEffect } from 'react';
import FormularioBusca from './FormularioBusca';
import ListaDeImoveis from './ListaDeImoveis';

function PaginaBuscar() {
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [primeiraBuscaRealizada, setPrimeiraBuscaRealizada] = useState(false); // Para controlar a mensagem inicial

  const handleBuscar = async (filtros = {}) => { // Adicionado um valor padrão para filtros
    console.log('Realizando busca com filtros:', filtros);
    const { termo, quartos, banheiros, vagas, cidade, bairro, precoMin, precoMax, tipoNegocio } = filtros;

    // Constrói a URL usando URLSearchParams para melhor formatação e segurança
    const url = new URL('http://localhost:5000/api/buscar'); // URL COMPLETA para o backend
    const params = new URLSearchParams();

    // Adiciona parâmetros apenas se existirem
    if (termo) params.append('q', termo);
    if (quartos) params.append('quartos', quartos);
    if (banheiros) params.append('banheiros', banheiros);
    if (vagas) params.append('vagas', vagas);
    if (cidade) params.append('cidade', cidade);
    if (bairro) params.append('bairro', bairro);
    // Para preço, garantir que sejam números válidos antes de adicionar
    if (precoMin && !isNaN(parseFloat(precoMin))) params.append('precoMin', precoMin);
    if (precoMax && !isNaN(parseFloat(precoMax))) params.append('precoMax', precoMax);
    if (tipoNegocio) params.append('tipoNegocio', tipoNegocio);

    url.search = params.toString(); // Converte os parâmetros para string de query e adiciona à URL

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Erro na busca: ${response.status} - ${response.statusText}. Detalhes: ${errorBody}`);
      }
      const data = await response.json();
      setResultadosBusca(data);
      console.log('Resultados da busca:', data);
    } catch (error) {
      console.error('Erro ao buscar imóveis:', error);
      setResultadosBusca([]); // Limpa resultados em caso de erro
    } finally {
      setPrimeiraBuscaRealizada(true); // Marca que a primeira busca (seja automática ou manual) foi realizada
    }
  };

  // useEffect para realizar a busca inicial ao carregar a página
  useEffect(() => {
    handleBuscar(); // Chama a busca sem filtros para carregar todos os imóveis aprovados inicialmente
  }, []); // O array vazio [] garante que esta função seja executada apenas uma vez ao montar o componente

  return (
    <div className="pagina-buscar">
      <h2>Buscar Imóveis</h2>
      <FormularioBusca onBuscar={handleBuscar} />

      <section id="resultados-busca">
        <h3>Resultados da Busca</h3>
        {/* Renderiza a mensagem "Nenhum imóvel encontrado" apenas se a primeira busca já foi feita e não encontrou nada */}
        {primeiraBuscaRealizada && resultadosBusca.length === 0 ? (
          <p>Nenhum imóvel encontrado para sua busca.</p>
        ) : (
          // ListaDeImoveis pode lidar com um array vazio e exibir sua própria mensagem se necessário
          <ListaDeImoveis imoveis={resultadosBusca} />
        )}
      </section>
    </div>
  );
}

export default PaginaBuscar;