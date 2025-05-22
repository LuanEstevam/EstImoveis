import React, { useState, useEffect } from 'react';
import styles from './AdminContatosList.module.css'; // Vamos criar este CSS

function AdminContatosList() {
  const [contatos, setContatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchContatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }

      const response = await fetch('http://localhost:3000/admin/contatos', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DEBUG (Frontend - AdminContatosList GET): Resposta de erro do backend (texto):', errorText);
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
      setContatos(data);
    } catch (err) {
      setError(err);
      console.error("Erro ao carregar contatos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContato = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este contato? Esta ação é irreversível.')) {
      setLoading(true);
      setError(null);
      setSuccessMessage('');

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token de autenticação não encontrado. Faça login novamente.');
        }

        const response = await fetch(`http://localhost:3000/admin/contatos/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('DEBUG (Frontend - AdminContatosList DELETE): Resposta de erro do backend (texto):', errorText);
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = `Erro inesperado do servidor. Resposta não é JSON. Status: ${response.status}. Conteúdo: ${errorText.substring(0, 100)}...`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json(); // Se o backend retorna JSON de sucesso
        setSuccessMessage('Contato excluído com sucesso!');
        setContatos(prevContatos => prevContatos.filter(contato => contato.id !== id));
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError(err);
        console.error('Erro ao excluir contato:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchContatos();
  }, []);

  if (loading) {
    return <div>Carregando contatos...</div>;
  }

  if (error) {
    return <div className={styles.errorMessage}>Erro: {error.message}</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Contatos Recebidos</h2>
      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
      <div className={styles.contactList}>
        {contatos.length === 0 ? (
          <p>Nenhum contato recebido ainda.</p>
        ) : (
          contatos.map(contato => (
            <div key={contato.id} className={styles.contactCard}>
              <h3>De: {contato.nome} ({contato.email})</h3>
              <p>Telefone: {contato.telefone}</p>
              <p>Assunto: {contato.assunto}</p>
              <p>Mensagem: {contato.mensagem}</p>
              <p className={styles.date}>Recebido em: {new Date(contato.data_envio).toLocaleString()}</p>
              <button
                onClick={() => handleDeleteContato(contato.id)}
                className={styles.deleteButton}
              >
                Excluir Contato
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminContatosList;
