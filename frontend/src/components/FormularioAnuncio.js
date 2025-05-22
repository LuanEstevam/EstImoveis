import React, { useState } from 'react';
import './FormularioAnuncio.css'; // Crie este arquivo CSS

function FormularioAnuncio() {
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('');
  const [preco, setPreco] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [quartos, setQuartos] = useState('');
  const [banheiros, setBanheiros] = useState('');
  const [vagas, setVagas] = useState('');
  const [areaUtil, setAreaUtil] = useState('');
  const [areaTotal, setAreaTotal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [fotosSelecionadas, setFotosSelecionadas] = useState([]);
  const [tipoNegocio, setTipoNegocio] = useState(''); // Novo estado para tipo de negócio

  const handleFotoChange = (event) => {
    setFotosSelecionadas(Array.from(event.target.files));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('tipo', tipo);
    formData.append('preco', preco);
    formData.append('tipo_negocio', tipoNegocio); // Adicione o tipo de negócio ao FormData
    formData.append('endereco', endereco);
    formData.append('bairro', bairro);
    formData.append('cidade', cidade);
    formData.append('quartos', parseInt(quartos) || 0);
    formData.append('banheiros', parseInt(banheiros) || 0);
    formData.append('vagas', parseInt(vagas) || 0);
    formData.append('area_util', parseFloat(areaUtil) || 0);
    formData.append('area_total', parseFloat(areaTotal) || 0);
    formData.append('descricao', descricao);

    fotosSelecionadas.forEach(foto => {
      formData.append('fotos', foto); // Append cada arquivo com o nome 'fotos'
    });

    try {
      const response = await fetch('/api/anunciar', {
        method: 'POST',
        body: formData, // Envie o FormData como corpo da requisição
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem(data.mensagem);
        setErro('');
        // Limpar o formulário após o sucesso
        setTitulo('');
        setTipo('');
        setPreco('');
        setEndereco('');
        setBairro('');
        setCidade('');
        setQuartos('');
        setBanheiros('');
        setVagas('');
        setAreaUtil('');
        setAreaTotal('');
        setDescricao('');
        setFotosSelecionadas([]); // Limpar as fotos selecionadas
        setTipoNegocio('');     // Limpar o tipo de negócio
      } else {
        setErro(data.error || 'Erro ao anunciar o imóvel.');
        setMensagem('');
      }
    } catch (error) {
      setErro('Erro de conexão com o servidor.');
      setMensagem('');
    }
  };

  return (
    <div className="formulario-anuncio">
      <h2>Anunciar Novo Imóvel</h2>
      {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}
      {erro && <p className="mensagem-erro">{erro}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="titulo">Título:</label>
          <input type="text" id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="tipo">Tipo:</label>
          <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} required>
            <option value="">Selecione</option>
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
            <option value="terreno">Terreno</option>
            <option value="comercial">Comercial</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="tipo_negocio">Tipo de Negócio:</label>
          <select
            id="tipo_negocio"
            name="tipo_negocio"
            value={tipoNegocio}
            onChange={(e) => setTipoNegocio(e.target.value)}
            required
          >
            <option value="">Selecione</option>
            <option value="venda">Venda</option>
            <option value="aluguel">Aluguel</option>
          </select>
        </div>
        <div>
          <label htmlFor="preco">Preço (R$):</label>
          <input type="number" id="preco" value={preco} onChange={(e) => setPreco(e.target.value)} />
        </div>
        <div>
          <label htmlFor="endereco">Endereço:</label>
          <input type="text" id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="bairro">Bairro:</label>
          <input type="text" id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="cidade">Cidade:</label>
          <input type="text" id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="quartos">Quartos:</label>
          <input type="number" id="quartos" value={quartos} onChange={(e) => setQuartos(e.target.value)} min="0" />
        </div>
        <div>
          <label htmlFor="banheiros">Banheiros:</label>
          <input type="number" id="banheiros" value={banheiros} onChange={(e) => setBanheiros(e.target.value)} min="0" />
        </div>
        <div>
          <label htmlFor="vagas">Vagas de Garagem:</label>
          <input type="number" id="vagas" value={vagas} onChange={(e) => setVagas(e.target.value)} min="0" />
        </div>
        <div>
          <label htmlFor="area_util">Área Útil (m²):</label>
          <input type="number" id="area_util" value={areaUtil} onChange={(e) => setAreaUtil(e.target.value)} min="0" />
        </div>
        <div>
          <label htmlFor="area_total">Área Total (m²):</label>
          <input type="number" id="area_total" value={areaTotal} onChange={(e) => setAreaTotal(e.target.value)} min="0" />
        </div>
        <div>
          <label htmlFor="descricao">Descrição:</label>
          <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows="4"></textarea>
        </div>
        <div>
          <label htmlFor="fotos">Fotos do Imóvel:</label>
          <input type="file" id="fotos" multiple onChange={handleFotoChange} />
        </div>
        <button type="submit">Anunciar Imóvel</button>
      </form>
    </div>
  );
}

export default FormularioAnuncio;
