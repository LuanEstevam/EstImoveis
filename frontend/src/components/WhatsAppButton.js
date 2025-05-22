import React from 'react';
import './WhatsAppButton.css'; // Crie este arquivo CSS para estilização
import WhatsAppIcon from './whatsapp-icon.png'; // Importe um ícone do WhatsApp (você precisará criar ou baixar um)

function WhatsAppButton() {
  const whatsappNumber = '5532998711805'; // Substitua pelo seu número, ex: '5532999999999'
  const message = 'Olá! Gostaria de mais informações.'; // Mensagem inicial opcional

  const whatsappLink = `https://wa.me/${whatsappNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

  return (
    <a
      href={whatsappLink}
      className="whatsapp-button"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img src={WhatsAppIcon} alt="WhatsApp" className="whatsapp-icon" />
    </a>
  );
}

export default WhatsAppButton;
