import React, { useState } from 'react';
import './Contato.css'; // Você pode criar um arquivo CSS para estilizar a página

function Contato() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/enviar-contato', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, telefone, assunto, mensagem }), // Incluímos telefone e assunto
      });

      if (response.ok) {
        alert('Mensagem enviada com sucesso!');
        setNome('');
        setEmail('');
        setTelefone('');
        setAssunto('');
        setMensagem('');
      } else {
        alert('Erro ao enviar a mensagem.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      alert('Erro de conexão ao enviar a mensagem.');
    }
  };

  return (
    <div className="pagina-contato">
      <h1>Entre em Contato</h1>
      <p>Se você tiver alguma dúvida, sugestão ou precisar de suporte, entre em contato conosco através do formulário abaixo ou das informações de contato.</p>

      <div className="formulario-contato">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="telefone">Telefone:</label>
            <input
              type="tel" // Usamos 'tel' para um campo de telefone
              id="telefone"
              name="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="assunto">Assunto:</label>
            <input
              type="text"
              id="assunto"
              name="assunto"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="mensagem">Mensagem:</label>
            <textarea
              id="mensagem"
              name="mensagem"
              rows="5"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              required
            ></textarea>
          </div>
          <button type="submit" className="botao-enviar">Enviar Mensagem</button>
        </form>
      </div>

      <div className="informacoes-contato">
        <h2>Informações de Contato</h2>
        <p><strong>Endereço:</strong> Rua Exemplo, 123, Bairro Centro, Juiz de Fora - MG</p>
        <p><strong>Telefone:</strong> (32) 99999-9999</p>
        <p><strong>Email:</strong> contato@estimoveis.com.br</p>
      </div>
    </div>
  );
}

export default Contato;
