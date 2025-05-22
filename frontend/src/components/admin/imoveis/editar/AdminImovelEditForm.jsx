// src/components/admin/imoveis/editar/AdminImovelEditForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './AdminImovelEditForm.module.css'; // Crie este arquivo CSS Module

function AdminImovelEditForm() {
  const { id } = useParams(); // Pega o ID do imóvel da URL
  const navigate = useNavigate();
  const [imovel, setImovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Adicione estados para cada campo que você deseja editar
  const [titulo, setTitulo] = useState('');
  const [preco, setPreco] = useState('');
  const [tipo, setTipo] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [quartos, setQuartos] = useState('');
  const [banheiros, setBanheiros] = useState('');
  const [vagas, setVagas] = useState('');
  const [area_util, setAreaUtil] = useState('');
  const [area_total, setAreaTotal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo_negocio, setTipoNegocio] = useState('');
  const [destaque, setDestaque] = useState('');
  const [novasFotos, setNovasFotos] = useState([]);
  const [fotosParaRemover, setFotosParaRemover] = useState([]);

  useEffect(() => {
    const fetchImovelData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token'); // Pega o token do localStorage
        if (!token) {
          throw new Error('Token de autenticação não encontrado. Por favor, faça login.');
        }

        console.log('Fetching imovel with ID:', `http://localhost:3000/api/imoveis/${id}`);

        const response = await fetch(`http://localhost:3000/api/imoveis/${id}`, { // Adicionado o URL completo
          method: 'GET', // Método explícito para clareza
          headers: {
            'Authorization': `Bearer ${token}` // ENVIA O TOKEN AQUI!
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('DEBUG (AdminImovelEditForm - GET): Resposta de erro do backend (texto):', errorText);
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = `Erro inesperado do servidor ao carregar imóvel. Resposta não é JSON. Status: ${response.status}. Conteúdo: ${errorText.substring(0, 100)}...`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Dados recebidos da API:', data);
        setImovel(data);
        setTitulo(data.titulo || '');
        setPreco(data.preco || '');
        setTipo(data.tipo || '');
        setEndereco(data.endereco || '');
        setBairro(data.bairro || '');
        setCidade(data.cidade || '');
        setQuartos(data.quartos || '');
        setBanheiros(data.banheiros || '');
        setVagas(data.vagas || '');
        setAreaUtil(data.area_util || '');
        setAreaTotal(data.area_total || '');
        setDescricao(data.descricao || '');
        setTipoNegocio(data.tipo_negocio || '');
        setDestaque(data.destaque ? '1' : '0');
      } catch (err) {
        setError(err);
        console.error('Erro ao carregar imóvel para edição:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImovelData();
  }, [id]); // Dependência do useEffect

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    switch (name) {
      case 'titulo': setTitulo(value); break;
      case 'preco': setPreco(value); break;
      case 'tipo': setTipo(value); break;
      case 'endereco': setEndereco(value); break;
      case 'bairro': setBairro(value); break;
      case 'cidade': setCidade(value); break;
      case 'quartos': setQuartos(value); break;
      case 'banheiros': setBanheiros(value); break;
      case 'vagas': setVagas(value); break;
      case 'area_util': setAreaUtil(value); break;
      case 'area_total': setAreaTotal(value); break;
      case 'descricao': setDescricao(value); break;
      case 'tipo_negocio': setTipoNegocio(value); break;
      case 'destaque': setDestaque(type === 'checkbox' ? (checked ? '1' : '0') : value); break;
      default: break;
    }
  };

  const handleNovasFotosSelecionadas = (event) => {
    setNovasFotos(Array.from(event.target.files));
  };

  const handleRemoverFotoExistente = (fotoParaRemover) => {
    setFotosParaRemover(prev => [...prev, fotoParaRemover.split('/').pop()]); // Adiciona apenas o nome do arquivo
  };

  const handleSubmit = async (event) => { // Tornar handleSubmit async
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(''); // Limpa mensagens anteriores

    try {
      const token = localStorage.getItem('token'); // Pega o token para o PUT também
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Por favor, faça login.');
      }

      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('preco', preco);
      formData.append('tipo', tipo);
      formData.append('endereco', endereco);
      formData.append('bairro', bairro);
      formData.append('cidade', cidade);
      formData.append('quartos', parseInt(quartos));
      formData.append('banheiros', parseInt(banheiros));
      formData.append('vagas', parseInt(vagas));
      formData.append('area_util', parseFloat(area_util));
      formData.append('area_total', parseFloat(area_total));
      formData.append('descricao', descricao);
      formData.append('tipo_negocio', tipo_negocio);
      formData.append('destaque', destaque === '1' ? '1' : '0');

      novasFotos.forEach(file => {
        formData.append('novasFotos', file);
      });

      if (fotosParaRemover.length > 0) {
        formData.append('fotosParaRemover', JSON.stringify(fotosParaRemover));
      }

      console.log('Dados FormData sendo enviados para PUT:', formData);

      const response = await fetch(`http://localhost:3000/api/imoveis/${id}`, { // URL completo aqui também
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}` // ENVIA O TOKEN AQUI PARA O PUT TAMBÉM!
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DEBUG (AdminImovelEditForm - PUT): Resposta de erro do backend (texto):', errorText);
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Erro inesperado do servidor ao atualizar imóvel. Resposta não é JSON. Status: ${response.status}. Conteúdo: ${errorText.substring(0, 100)}...`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Imóvel atualizado com sucesso:', data);
      setSuccessMessage('Imóvel atualizado com sucesso!');
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/admin/imoveis');
      }, 3000);
    } catch (err) {
      setError(err);
      console.error('Erro ao atualizar imóvel:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando formulário de edição...</div>;
  }

  if (error) {
    return <div className={styles.error}>Erro ao carregar ou atualizar imóvel: {error.message}</div>;
  }

  if (!imovel) {
    // Isso pode acontecer se o fetchImovelData falhou e não foi possível carregar o imóvel
    return <div>Não foi possível carregar os detalhes do imóvel. Verifique o console para mais informações.</div>;
  }

  // Resto do formulário de renderização
  return (
    <div className={styles.container}>
      <h2>Editar Imóvel #{id}</h2>
      {successMessage && <div className={styles.success}>{successMessage}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="titulo">Título:</label>
          <input type="text" id="titulo" name="titulo" value={titulo} onChange={handleInputChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="preco">Preço:</label>
          <input type="number" id="preco" name="preco" value={preco} onChange={handleInputChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="tipo">Tipo:</label>
          <input type="text" id="tipo" name="tipo" value={tipo} onChange={handleInputChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="endereco">Endereço:</label>
          <input type="text" id="endereco" name="endereco" value={endereco} onChange={handleInputChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="bairro">Bairro:</label>
          <input type="text" id="bairro" name="bairro" value={bairro} onChange={handleInputChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="cidade">Cidade:</label>
          <input type="text" id="cidade" name="cidade" value={cidade} onChange={handleInputChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="quartos">Quartos:</label>
          <input type="number" id="quartos" name="quartos" value={quartos} onChange={handleInputChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="banheiros">Banheiros:</label>
          <input type="number" id="banheiros" name="banheiros" value={banheiros} onChange={handleInputChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="vagas">Vagas:</label>
          <input type="number" id="vagas" name="vagas" value={vagas} onChange={handleInputChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="area_util">Área Útil:</label>
          <input type="number" id="area_util" name="area_util" value={area_util} onChange={handleInputChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="area_total">Área Total:</label>
          <input type="number" id="area_total" name="area_total" value={area_total} onChange={handleInputChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="descricao">Descrição:</label>
          <textarea id="descricao" name="descricao" value={descricao} onChange={handleInputChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="tipo_negocio">Tipo de Negócio:</label>
          <input type="text" id="tipo_negocio" name="tipo_negocio" value={tipo_negocio} onChange={handleInputChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="destaque">Destaque:</label>
          <input type="checkbox" id="destaque" name="destaque" checked={destaque === '1'} onChange={handleInputChange} className={styles.input} />
        </div>

        {imovel.fotos && imovel.fotos.length > 0 && (
          <div className={styles.formGroup}>
            <label>Fotos Existentes:</label>
            <div className={styles.existingPhotos}>
              {imovel.fotos.map((foto, index) => {
                // Filtra fotos que já foram marcadas para remoção
                const filename = foto.split('/').pop();
                if (fotosParaRemover.includes(filename)) {
                  return null; // Não renderiza a foto se ela foi marcada para remoção
                }
                return (
                  <div key={index} className={styles.existingPhotoItem}>
                    <img src={`http://localhost:3000${foto}`} alt={`Foto existente ${index + 1}`} className={styles.existingPhoto} />
                    <button
                      type="button"
                      onClick={() => handleRemoverFotoExistente(foto)}
                      className={styles.removePhotoButton}
                    >
                      Remover
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="novasFotos">Adicionar Novas Fotos:</label>
          <input
            type="file"
            id="novasFotos"
            name="novasFotos"
            multiple
            onChange={handleNovasFotosSelecionadas}
            className={styles.input}
          />
        </div>

        <button type="submit" className={styles.button}>Salvar Alterações</button>
        <button type="button" onClick={() => navigate('/admin/imoveis')} className={styles.button}>Cancelar</button>
      </form>
    </div>
  );
}

export default AdminImovelEditForm;
