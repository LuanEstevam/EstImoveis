import React, { useState } from 'react';
import './Carrossel.css'; // Crie este arquivo CSS

function Carrossel({ fotos }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + fotos.length) % fotos.length;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % fotos.length;
    setCurrentIndex(newIndex);
  };

  if (!fotos || fotos.length === 0) {
    return <img src="/img/imagem-padrao.jpg" alt="Sem fotos" />;
  }

  console.log("Fotos recebidas no Carrossel:", fotos);

    return (
       <div className="carrossel-container">
         <button className="carrossel-button carrossel-prev" onClick={goToPrevious}>
           &lt;
         </button>
         <img
           src={fotos[currentIndex] || '/img/imagem-padrao.jpg'}
           alt={`Foto ${currentIndex + 1}`}
           className="carrossel-image"
         />
         <button className="carrossel-button carrossel-next" onClick={goToNext}>
           &gt;
         </button>
         <div className="carrossel-dots">
           {fotos.map((_, index) => (
             <span
               key={index}
               className={`carrossel-dot ${index === currentIndex ? 'active' : ''}`}
               onClick={() => setCurrentIndex(index)}
             />
           ))}
         </div>
       </div>
     );
}

export default Carrossel;
