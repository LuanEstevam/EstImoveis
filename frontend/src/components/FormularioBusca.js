// src/components/FormularioBusca.js
import React, { useState } from 'react';
import './FormularioBusca.css'; // Crie um arquivo CSS para estilizar o formulário

function FormularioBusca({ onBuscar }) {
  const [termo, setTermo] = useState('');
  const [quartos, setQuartos] = useState('');
  const [banheiros, setBanheiros] = useState('');
  const [vagas, setVagas] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState(''); // 'aluguel' ou 'venda'

  const handleSubmit = (event) => {
    event.preventDefault();
    onBuscar({
      termo,
      quartos,
      banheiros,
      vagas,
      cidade,
      bairro,
      precoMin,
      precoMax,
      tipoNegocio,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-busca">
      <div className="form-group">
        <label htmlFor="termo">Buscar por título ou descrição:</label>
        <input
          type="text"
          id="termo"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Digite o que procura..."
        />
      </div>

      <div className="filtros">
        <div className="form-group">
          <label htmlFor="quartos">Quartos:</label>
          <select id="quartos" value={quartos} onChange={(e) => setQuartos(e.target.value)}>
            <option value="">Qualquer</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="banheiros">Banheiros:</label>
          <select id="banheiros" value={banheiros} onChange={(e) => setBanheiros(e.target.value)}>
            <option value="">Qualquer</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="vagas">Garagem:</label>
          <select id="vagas" value={vagas} onChange={(e) => setVagas(e.target.value)}>
            <option value="">Qualquer</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="cidade">Cidade:</label>
          <input
            type="text"
            id="cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Digite a cidade"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bairro">Bairro:</label>
          <input
            type="text"
            id="bairro"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            placeholder="Digite o bairro"
          />
        </div>

        <div className="form-group preco">
          <label>Faixa de Preço:</label>
          <input
            type="number"
            id="precoMin"
            value={precoMin}
            onChange={(e) => setPrecoMin(e.target.value)}
            placeholder="Min"
          />
          <input
            type="number"
            id="precoMax"
            value={precoMax}
            onChange={(e) => setPrecoMax(e.target.value)}
            placeholder="Max"
          />
        </div>

        <div className="form-group tipo-negocio">
          <label htmlFor="tipoNegocio">Tipo:</label>
          <select id="tipoNegocio" value={tipoNegocio} onChange={(e) => setTipoNegocio(e.target.value)}>
            <option value="">Qualquer</option>
            <option value="venda">Venda</option>
            <option value="aluguel">Aluguel</option>
          </select>
        </div>
      </div>

      <button type="submit">Buscar Imóveis</button>
    </form>
  );
}

export default FormularioBusca;