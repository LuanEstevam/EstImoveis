import React, { useState } from 'react';
import FormularioBusca from './FormularioBusca';
import ListaDeImoveis from './ListaDeImoveis';

function PaginaBuscar() {
  const [resultadosBusca, setResultadosBusca] = useState([]);

  const handleBuscar = (filtros) => {
    console.log('Realizando busca com filtros:', filtros);
    const { termo, quartos, banheiros, vagas, cidade, bairro, precoMin, precoMax, tipoNegocio } = filtros;

    let url = `/api/buscar?q=${termo || ''}`;
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

export default PaginaBuscar;
