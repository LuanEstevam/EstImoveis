// src/components/admin/AdminLayout.jsx
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom'; // <-- Importe useNavigate
import styles from './AdminLayout.module.css'; // Crie este CSS para o layout admin

function AdminLayout() {
  const navigate = useNavigate(); // <-- Inicialize o hook useNavigate

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove o token do localStorage
    navigate('/admin/login'); // Redireciona para a página de login
  };

  return (
    <div className={styles.adminDashboard}> {/* Você usou adminDashboard, mantido aqui */}
      <aside className={styles.sidebar}>
        <h3>Painel Admin</h3>
        <nav>
          <ul className={styles.navList}>
            <li><Link to="/admin" className={styles.navLink}>Dashboard</Link></li> {/* Adicione um link para o Dashboard principal */}
            <li><Link to="/admin/imoveis" className={styles.navLink}>Imóveis</Link></li>
            <li><Link to="/admin/imoveis/anunciar" className={styles.navLink}>Anunciar Imóvel</Link></li> {/* Adicionei este link, se precisar */}
            <li><Link to="/admin/contatos" className={styles.navLink}>Contatos</Link></li>
            {/* Adicione outros links administrativos aqui */}
            <li>
              <button onClick={handleLogout} className={styles.logoutButton}> {/* <-- Botão de Logout */}
                Sair
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className={styles.content}>
        <Outlet /> {/* Aqui serão renderizados os componentes de rota filhos, como AdminImoveisList */}
      </main>
    </div>
  );
}

export default AdminLayout;
