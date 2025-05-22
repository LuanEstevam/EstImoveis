import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importe useNavigate aqui
import styles from './MenuPrincipal.module.css'; // Assumindo que você tem um CSS para o menu

// Recebe isLoggedIn e handleLogout como props
function MenuPrincipal({ isLoggedIn, handleLogout }) {
  const navigate = useNavigate(); // Use o hook useNavigate aqui, pois este componente está dentro do Router

  const onLogoutClick = () => {
    handleLogout(); // Chama a função de logout do App.js para limpar o token
    navigate('/admin/login'); // Redireciona para a página de login
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">EstImoveis</Link>
      </div>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li className={styles.navItem}><Link to="/">Home</Link></li>
          <li className={styles.navItem}><Link to="/imoveis">Imóveis</Link></li>
          <li className={styles.navItem}><Link to="/anunciar">Anunciar</Link></li>
          <li className={styles.navItem}><Link to="/contato">Contato</Link></li>
          {isLoggedIn ? (
            // Se logado, mostra link para admin e botão de sair
            <>
              <li className={styles.navItem}><Link to="/admin/imoveis">Admin</Link></li>
              <li className={styles.navItem}>
                <button onClick={onLogoutClick} className={styles.logoutButton}>Sair</button>
              </li>
            </>
          ) : (
            // Se não logado, mostra link para login
            <li className={styles.navItem}><Link to="/admin/login">Login Admin</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default MenuPrincipal;
