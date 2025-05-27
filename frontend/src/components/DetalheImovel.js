// src/components/DetalheImovel.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './DetalheImovel.css'; // Importe o CSS para esta página

function DetalheImovel() {
  const { id } = useParams();
  const [imovel, setImovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0); // Para o carrossel

  // Estados para o formulário de contato
  const [formData, setFormData] = useState({
      nome: '',
      email: '',
      telefone: '',
      mensagem: '',
  });
  const [formStatus, setFormStatus] = useState({ type: '', message: '' }); // Para feedback ao usuário

  useEffect(() => {
    const fetchImovel = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/imoveis/${id}`);
        if (!response.ok) {
          throw new Error(`Erro ao buscar imóvel: ${response.statusText}`);
        }
        const data = await response.json();
        setImovel(data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchImovel();
  }, [id]); // O efeito será executado novamente se o ID na URL mudar

  const nextPhoto = () => {
    if (imovel && imovel.fotos && imovel.fotos.length > 0) {
      setCurrentPhotoIndex((prevIndex) =>
        (prevIndex + 1) % imovel.fotos.length
      );
    }
  };

  const prevPhoto = () => {
    if (imovel && imovel.fotos && imovel.fotos.length > 0) {
      setCurrentPhotoIndex((prevIndex) =>
        (prevIndex - 1 + imovel.fotos.length) % imovel.fotos.length
      );
    }
  };

  const goToPhoto = (index) => {
    setCurrentPhotoIndex(index);
  };

  // Função para atualizar o estado do formulário de contato
  const handleChange = (e) => {
      setFormData({
          ...formData,
          [e.target.name]: e.target.value,
      });
  };

  // Função para lidar com o envio do formulário de contato
  const handleSubmit = async (e) => {
      e.preventDefault(); // Previne o comportamento padrão de recarregar a página

      setFormStatus({ type: '', message: '' }); // Limpa status anterior

      // O assunto será o título do imóvel
      // O 'assunto' é um campo que o backend espera na sua rota /api/enviar-contato
      const assunto = `Interesse no Imóvel: ${imovel.titulo} (ID: ${imovel.id})`;

      try {
          const response = await fetch('http://localhost:5000/api/enviar-contato', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ...formData, assunto }), // Envia os dados do formulário e o assunto
          });

          const data = await response.json();

          if (response.ok) {
              setFormStatus({ type: 'success', message: 'Mensagem enviada com sucesso! Em breve entraremos em contato.' });
              setFormData({ nome: '', email: '', telefone: '', mensagem: '' }); // Limpa o formulário
          } else {
              setFormStatus({ type: 'error', message: data.message || 'Erro ao enviar mensagem.' });
          }
      } catch (error) {
          console.error('Erro de rede ou servidor:', error);
          setFormStatus({ type: 'error', message: 'Erro ao conectar com o servidor. Tente novamente mais tarde.' });
      }
  };

  if (loading) {
    return <p className="container">Carregando detalhes do imóvel...</p>;
  }

  if (error) {
    return <p className="container">Erro ao carregar detalhes: {error.message}</p>;
  }

  if (!imovel) {
    return <p className="container">Imóvel não encontrado.</p>;
  }

  // Função para formatar o preço
  const formatPrice = (price) => {
    if (!price) return 'Preço Sob Consulta';
    return `R$ ${parseFloat(price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Monta URL do Google Maps
  // Certifique-se de que o backend envia endereco, bairro, cidade, estado, cep
  // Lembre-se de substituir "SUA_CHAVE_API_DO_Maps" pela sua chave real
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=SUA_CHAVE_API_DO_Maps&q=${encodeURIComponent(`${imovel.endereco}, ${imovel.bairro}, ${imovel.cidade}, ${imovel.estado}, ${imovel.cep}`)}`;


  return (
    <div className="detalhe-imovel-container">
      <h2>{imovel.titulo}</h2>

      {/* Carrossel de Fotos */}
      {imovel.fotos && imovel.fotos.length > 0 ? (
        <div className="carrossel-fotos">
          <img
            src={`http://localhost:3000${imovel.fotos[currentPhotoIndex]}`}
            alt={`Foto ${currentPhotoIndex + 1} de ${imovel.titulo}`}
          />
          <div className="navegacao-carrossel">
            <button onClick={prevPhoto}>❮</button>
            <button onClick={nextPhoto}>❯</button>
          </div>
          <div className="dots-indicadores">
            {imovel.fotos.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentPhotoIndex ? 'active' : ''}`}
                onClick={() => goToPhoto(index)}
              ></span>
            ))}
          </div>
        </div>
      ) : (
        <div className="carrossel-fotos">
          <img src="/img/imagem-padrao.jpg" alt="Imagem Padrão" />
        </div>
      )}

      {/* Informações Gerais */}
      <div className="info-geral">
        <div>
          <strong>Preço:</strong>
          <p>{formatPrice(imovel.preco)}</p>
        </div>
        <div>
          <strong>Tipo de Negócio:</strong>
          <p>{imovel.tipo_negocio === 'venda' ? 'Venda' : 'Aluguel'}</p>
        </div>
        <div>
          <strong>Tipo de Imóvel:</strong>
          <p>{imovel.tipo}</p>
        </div>
        {imovel.quartos && (
          <div>
            <strong>Quartos:</strong>
            <p>{imovel.quartos}</p>
          </div>
        )}
        {imovel.suites && (
          <div>
            <strong>Suítes:</strong>
            <p>{imovel.suites}</p>
          </div>
        )}
        {imovel.banheiros && (
          <div>
            <strong>Banheiros:</strong>
            <p>{imovel.banheiros}</p>
          </div>
        )}
        {imovel.vagas && (
          <div>
            <strong>Vagas de Garagem:</strong>
            <p>{imovel.vagas}</p>
          </div>
        )}
        {imovel.area_util && ( // Usando area_util conforme seu DB
          <div>
            <strong>Área Útil:</strong>
            <p>{imovel.area_util} m²</p>
          </div>
        )}
        {imovel.area_total && ( // Usando area_total conforme seu DB
          <div>
            <strong>Área Total:</strong>
            <p>{imovel.area_total} m²</p>
          </div>
        )}
      </div>

      {/* Descrição Detalhada */}
      <div className="detalhes-texto">
        <h3>Descrição do Imóvel</h3>
        <p>{imovel.descricao || 'Nenhuma descrição detalhada fornecida.'}</p>

        {/* Características/Comodidades (Exemplo: se você tiver um campo 'caracteristicas' como JSON string) */}
        {/* Você pode adicionar um campo 'caracteristicas' em seu DB se quiser uma lista de itens */}
        {/* Atualmente seu DB não tem 'caracteristicas', então essa parte ficará vazia por enquanto ou dará erro se tentar usar */}
        {/* Para usar, adicione uma coluna 'caracteristicas TEXT' ao seu DB e armazene como JSON string como '["Piscina", "Academia"]' */}
        {/* E certifique-se de que o backend parseie corretamente como foi feito com 'fotos' */}
        {/*
        {imovel.caracteristicas && imovel.caracteristicas.length > 0 && (
            <>
                <h3>Características</h3>
                <ul>
                    {imovel.caracteristicas.map((carac, index) => (
                        <li key={index}>{carac}</li>
                    ))}
                </ul>
            </>
        )}
        */}
      </div>

      {/* Localização com Mapa */}
      <div className="localizacao">
        <h3>Localização</h3>
        <p>{imovel.endereco}, {imovel.bairro}, {imovel.cidade} - {imovel.estado}, {imovel.cep}</p>
        <div className="mapa-container">
          <iframe
            src={googleMapsUrl}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização do Imóvel"
          ></iframe>
        </div>
      </div>

      {/* Formulário de Contato */}
      <div className="form-contato-imovel">
          <h3>Entre em Contato sobre este Imóvel</h3>
          {formStatus.message && (
              <p className={`form-message ${formStatus.type === 'success' ? 'success' : 'error'}`}>
                  {formStatus.message}
              </p>
          )}
          <form onSubmit={handleSubmit}>
              <div className="form-group">
                  <label htmlFor="nome">Nome Completo:</label>
                  <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                  />
              </div>
              <div className="form-group">
                  <label htmlFor="email">E-mail:</label>
                  <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                  />
              </div>
              <div className="form-group">
                  <label htmlFor="telefone">Telefone (opcional):</label>
                  <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                  />
              </div>
              <div className="form-group">
                  <label htmlFor="mensagem">Sua Mensagem:</label>
                  <textarea
                      id="mensagem"
                      name="mensagem"
                      rows="5"
                      value={formData.mensagem}
                      onChange={handleChange}
                      placeholder={`Tenho interesse no imóvel ${imovel.titulo} (ID: ${imovel.id})...`}
                      required
                  ></textarea>
              </div>
              <button type="submit">Enviar Mensagem</button>
          </form>
      </div>

    </div>
  );
}

export default DetalheImovel;