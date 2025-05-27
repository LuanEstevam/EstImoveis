// src/components/admin/AdminAnunciarImovel.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para redirecionar após o anúncio

function AdminAnunciarImovel() {
  const navigate = useNavigate(); // Hook para navegação
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'apartamento', // Valor inicial
    preco: '',
    endereco: '',
    bairro: '',
    cidade: '',
    quartos: 1,
    banheiros: 1,
    vagas: 0,
    area_util: '',
    area_total: '',
    descricao: '',
    tipo_negocio: 'venda', // Valor inicial (venda ou aluguel)
  });
  const [fotos, setFotos] = useState([]); // Para armazenar os arquivos de foto
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // Para exibir mensagens de sucesso/erro

  // Lida com a mudança nos campos de texto do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Lida com a seleção de arquivos (fotos)
  const handleFileChange = (e) => {
    setFotos(Array.from(e.target.files)); // Converte FileList para Array
  };

  // Lida com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const token = localStorage.getItem('token'); // Pega o token do localStorage
    if (!token) {
      setMessage('Erro: Você não está autenticado.');
      setLoading(false);
      return;
    }

    // Criar um FormData para enviar arquivos e outros dados
    const dataToSend = new FormData();
    for (const key in formData) {
      dataToSend.append(key, formData[key]);
    }
    fotos.forEach(foto => {
      dataToSend.append('fotos', foto); // 'fotos' deve corresponder ao nome do campo no multer do backend
    });

    try {
      // Ajuste a URL para usar o proxy se configurado no package.json do frontend
      // Exemplo com proxy: '/api/anunciar'
      // Exemplo sem proxy: 'http://localhost:5000/api/anunciar'
      const response = await fetch('/api/anunciar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Inclui o token no cabeçalho
          // NÃO COLOQUE 'Content-Type': 'application/json' AQUI!
          // O navegador define automaticamente 'multipart/form-data' quando você usa FormData
        },
        body: dataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Imóvel anunciado com sucesso!');
        // Opcional: Limpar o formulário ou redirecionar
        setFormData({
            titulo: '', tipo: 'apartamento', preco: '', endereco: '', bairro: '', cidade: '',
            quartos: 1, banheiros: 1, vagas: 0, area_util: '', area_total: '', descricao: '',
            tipo_negocio: 'venda'
        });
        setFotos([]);
        // Redireciona para a lista de imóveis após o sucesso
        navigate('/admin/imoveis');
      } else {
        setMessage(`Erro ao anunciar imóvel: ${result.error || result.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro na requisição de anúncio:', error);
      setMessage('Erro de rede ou servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-anunciar-imovel">
      <h2>Anunciar Novo Imóvel</h2>
      {message && <p className={message.includes('sucesso') ? 'success-message' : 'error-message'}>{message}</p>}
      
      <form onSubmit={handleSubmit} className="form-anunciar-imovel">
        {/* Campo Título */}
        <div className="form-group">
          <label htmlFor="titulo">Título:</label>
          <input type="text" id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} required />
        </div>

        {/* Campo Tipo (Apartamento, Casa, etc.) */}
        <div className="form-group">
          <label htmlFor="tipo">Tipo de Imóvel:</label>
          <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} required>
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
            <option value="terreno">Terreno</option>
            <option value="comercial">Comercial</option>
            <option value="condominio">Condomínio</option>
            <option value="fazenda">Fazenda/Sítio</option>
          </select>
        </div>

        {/* Campo Tipo de Negócio (Venda/Aluguel) */}
        <div className="form-group">
          <label htmlFor="tipo_negocio">Tipo de Negócio:</label>
          <select id="tipo_negocio" name="tipo_negocio" value={formData.tipo_negocio} onChange={handleChange} required>
            <option value="venda">Venda</option>
            <option value="aluguel">Aluguel</option>
          </select>
        </div>

        {/* Campo Preço */}
        <div className="form-group">
          <label htmlFor="preco">Preço (R$):</label>
          <input type="number" id="preco" name="preco" value={formData.preco} onChange={handleChange} required min="0" step="0.01" />
        </div>

        {/* Campo Endereço */}
        <div className="form-group">
          <label htmlFor="endereco">Endereço:</label>
          <input type="text" id="endereco" name="endereco" value={formData.endereco} onChange={handleChange} required />
        </div>

        {/* Campo Bairro */}
        <div className="form-group">
          <label htmlFor="bairro">Bairro:</label>
          <input type="text" id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} required />
        </div>

        {/* Campo Cidade */}
        <div className="form-group">
          <label htmlFor="cidade">Cidade:</label>
          <input type="text" id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} required />
        </div>

        {/* Quartos, Banheiros, Vagas (podem ser inputs type="number") */}
        <div className="form-group-inline">
          <div className="form-group">
            <label htmlFor="quartos">Quartos:</label>
            <input type="number" id="quartos" name="quartos" value={formData.quartos} onChange={handleChange} min="0" />
          </div>
          <div className="form-group">
            <label htmlFor="banheiros">Banheiros:</label>
            <input type="number" id="banheiros" name="banheiros" value={formData.banheiros} onChange={handleChange} min="0" />
          </div>
          <div className="form-group">
            <label htmlFor="vagas">Vagas:</label>
            <input type="number" id="vagas" name="vagas" value={formData.vagas} onChange={handleChange} min="0" />
          </div>
        </div>

        {/* Área Útil e Área Total */}
        <div className="form-group-inline">
          <div className="form-group">
            <label htmlFor="area_util">Área Útil (m²):</label>
            <input type="number" id="area_util" name="area_util" value={formData.area_util} onChange={handleChange} min="0" step="0.01" />
          </div>
          <div className="form-group">
            <label htmlFor="area_total">Área Total (m²):</label>
            <input type="number" id="area_total" name="area_total" value={formData.area_total} onChange={handleChange} min="0" step="0.01" />
          </div>
        </div>

        {/* Campo Descrição */}
        <div className="form-group">
          <label htmlFor="descricao">Descrição:</label>
          <textarea id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} rows="5" required></textarea>
        </div>

        {/* Campo Upload de Fotos */}
        <div className="form-group">
          <label htmlFor="fotos">Fotos do Imóvel (máx. 5):</label>
          <input type="file" id="fotos" name="fotos" multiple onChange={handleFileChange} accept="image/*" />
          {fotos.length > 0 && (
            <p className="fotos-selecionadas">
              Fotos selecionadas: {fotos.map(f => f.name).join(', ')}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Anunciando...' : 'Anunciar Imóvel'}
        </button>
      </form>
    </div>
  );
}

export default AdminAnunciarImovel;