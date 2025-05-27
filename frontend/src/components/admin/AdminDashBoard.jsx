// src/components/admin/AdminDashBoard.jsx (VERSÃO CORRETA FINAL)
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminDashBoard.module.css';

function AdminDashBoard() {
  return (
    <div className={styles.dashboardContainer}>
      <h2>Painel de Administração</h2>
      <div className={styles.cardGrid}>
        <Link to="/admin/imoveis" className={styles.dashboardCard}>
          <h3>Gerenciar Imóveis</h3>
          <p>Adicione, edite ou remova imóveis cadastrados.</p>
        </Link>
        <Link to="/admin/contatos" className={styles.dashboardCard}>
          <h3>Gerenciar Contatos</h3>
          <p>Visualize as mensagens enviadas pelos visitantes.</p>
        </Link>
        <Link to="/admin/imoveis/anunciar" className={styles.dashboardCard}>
          <h3>Anunciar Novo Imóvel</h3>
          <p>Cadastre um novo imóvel para venda ou aluguel.</p>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashBoard;