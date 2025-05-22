// src/components/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Se você estiver usando React Router

function AdminDashBoard() {
  return (
    <div>
      <h2>Painel de Administração</h2>
      <nav>
        <ul>
          <li><Link to="/admin/imoveis">Gerenciar Imóveis</Link></li>
          <li><Link to="/admin/contatos">Gerenciar Contatos</Link></li>
          {/* Outras seções da administração, se houver */}
        </ul>
      </nav>
      {/* O conteúdo das seções será renderizado aqui */}
    </div>
  );
}

export default AdminDashBoard;
