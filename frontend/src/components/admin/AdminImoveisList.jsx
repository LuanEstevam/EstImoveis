// src/components/admin/AdminImoveisList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminImoveisList.module.css'; // Certifique-se que este arquivo exista e tenha as classes

function AdminImoveisList() {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState('');

  const navigate = useNavigate();

  const fetchImoveis = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }

      // Usando URL completa para o backend na porta 5000.
      const response = await fetch('http://localhost:5000/api/imoveis/admin', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DEBUG (Frontend - AdminImoveisList GET): Resposta de erro do backend (texto):', errorText);
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Erro inesperado do servidor. Resposta não é JSON. Status: ${response.status}. Conteúdo: ${errorText.substring(0, 100)}...`;
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      console.log("Imóveis recebidos do backend:", data);
      setImoveis(data);
    } catch (err) {
      setError(err);
      console.error("Erro ao carregar imóveis no frontend:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImovel = async (id) => { // id já é o ID correto do SQLite
    if (window.confirm('Tem certeza que deseja excluir este imóvel? Esta ação é irreversível e excluirá as fotos!')) {
      setLoading(true);
      setError(null);
      setSuccessMessage('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token de autenticação não encontrado. Faça login novamente.');
        }

        // Usando URL completa para o backend na porta 5000.
        const response = await fetch(`http://localhost:5000/api/imoveis/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('DEBUG (Frontend - AdminImoveisList DELETE): Resposta de erro do backend (texto):', errorText);
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = `Erro inesperado do servidor. Resposta não é JSON. Status: ${response.status}. Conteúdo: ${errorText.substring(0, 100)}...`;
          }
          throw new Error(errorMessage);
        }
        const data = await response.json(); // Backend deve retornar confirmação JSON
        setSuccessMessage('Imóvel excluído com sucesso!');
        // Remove o imóvel da lista no estado local pelo ID correto do SQLite
        setImoveis(prevImoveis => prevImoveis.filter(imovel => imovel.id !== id));
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError(err);
        console.error('Erro ao excluir imóvel:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = async (imovelId, newStatus) => { // imovelId já é o ID correto do SQLite
    setStatusUpdateError(null);
    setStatusUpdateSuccess('');
    console.log(`DEBUG (Frontend): Tentando atualizar status do imóvel ID: ${imovelId} para: ${newStatus}`); // Log de depuração
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }

      // Usando URL completa para o backend na porta 5000.
      const response = await fetch(`http://localhost:5000/api/imoveis/${imovelId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DEBUG (Frontend - AdminImoveisList PUT Status): Resposta de erro do backend (texto):', errorText);
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch (e) {
            errorData = {}; // Garante que errorData seja um objeto mesmo se o parse falhar
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Status atualizado com sucesso:', data);
      setStatusUpdateSuccess(`Status do imóvel #${imovelId} atualizado para "${newStatus}".`);

      // Atualiza o status do imóvel na lista no estado local pelo ID correto do SQLite
      setImoveis(prevImoveis =>
        prevImoveis.map(imovel =>
          imovel.id === imovelId ? { ...imovel, status: newStatus } : imovel
        )
      );
      setTimeout(() => setStatusUpdateSuccess(''), 3000);

    } catch (err) {
      setStatusUpdateError(err);
      console.error('Erro ao atualizar status do imóvel:', err);
      setTimeout(() => setStatusUpdateError(null), 5000);
    }
  };

  useEffect(() => {
    fetchImoveis();
  }, []); // O array vazio [] garante que fetchImoveis seja chamado apenas uma vez no carregamento do componente

  if (loading) {
    return <div className={styles.loading}>Carregando imóveis para administração...</div>;
  }

  if (error) {
    return <div className={styles.errorMessage}>Erro: {error.message}</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Gerenciar Imóveis</h2>
      <button onClick={() => navigate('/admin/imoveis/anunciar')} className={styles.addButton}>
        Anunciar Novo Imóvel
      </button>

      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
      {statusUpdateSuccess && <div className={styles.successMessage}>{statusUpdateSuccess}</div>}
      {statusUpdateError && <div className={styles.errorMessage}>Erro ao atualizar status: {statusUpdateError.message}</div>}

      <div className={styles.imoveisGrid}>
        {imoveis.length === 0 ? (
          <p className={styles.noImoveisMessage}>Nenhum imóvel cadastrado ainda.</p>
        ) : (
          imoveis.map(imovel => (
            // Use 'imovel.id' para o ID do imóvel, que é a chave primária no SQLite.
            <div key={imovel.id} className={styles.imovelCard}>
              <p>ID: {imovel.id}</p>
              <h3>{imovel.titulo}</h3>
              <p>Preço: R$ {imovel.preco ? parseFloat(imovel.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : 'N/A'}</p>
              <p>Tipo: {imovel.tipo}</p>
              <p>Endereço: {imovel.endereco}, {imovel.bairro}, {imovel.cidade}</p>
              <p>Quartos: {imovel.quartos} | Banheiros: {imovel.banheiros} | Vagas: {imovel.vagas}</p>
              <p>Área Útil: {imovel.area_util}m² | Área Total: {imovel.area_total}m²</p>
              <p>Negócio: {imovel.tipo_negocio}</p>
              <p>Destaque: {imovel.destaque === 1 ? 'Sim' : 'Não'}</p>
              <p>Descrição: {imovel.descricao ? imovel.descricao.substring(0, 100) + '...' : 'N/A'}</p>

              <div className={styles.statusControl}>
                <label htmlFor={`status-${imovel.id}`}>Status:</label>
                <select
                  id={`status-${imovel.id}`}
                  value={imovel.status || 'pendente'}
                  onChange={(e) => handleStatusChange(imovel.id, e.target.value)}
                  className={styles.statusSelect}
                >
                  <option value="pendente">Pendente</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="vendido">Vendido</option>
                  <option value="alugado">Alugado</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              {imovel.fotos && imovel.fotos.length > 0 && (
                <div className={styles.fotoContainer}>
                  {/* Verifica se imovel.fotos[0] existe antes de tentar usá-lo */}
                  {imovel.fotos[0] ? (
                    <img
                      src={`http://localhost:5000${imovel.fotos[0]}`}
                      alt={imovel.titulo}
                      className={styles.imovelFoto}
                    />
                  ) : (
                    <img
                      src="/img/imagem-padrao.jpg" // Imagem padrão se não houver foto
                      alt="Imagem padrão"
                      className={styles.imovelFoto}
                    />
                  )}
                </div>
              )}
              <div className={styles.buttons}>
                <button
                  onClick={() => navigate(`/admin/imoveis/editar/${imovel.id}`)}
                  className={styles.editButton}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteImovel(imovel.id)}
                  className={styles.deleteButton}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminImoveisList;