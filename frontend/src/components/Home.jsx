// src/components/Home.jsx

import React from 'react';
import DestaquesHome from './DestaquesHome.js'; // Importe DestaquesHome aqui

function Home() {
  return (
    <>
      <section id="banner-principal">
        <div className="banner-content">
          <h2>Encontre o Imóvel Ideal para Você!</h2>
        </div>
      </section>
      <section id="sobre-nos">
        <h2>Sobre Nós</h2>
        <p>Aqui você pode inserir uma breve descrição da sua imobiliária, seus valores e diferenciais.</p>
      </section>
      <section id="destaques-react">
        <DestaquesHome />
      </section>
    </>
  );
}

export default Home;
