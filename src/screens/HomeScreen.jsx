import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeScreen.css';

export default function HomeScreen() {
  const navigate = useNavigate();
  const [ip, setIp] = useState('');

  useEffect(() => {
    const ipGuardada = localStorage.getItem('API_BASE_URL') || '';
    setIp(ipGuardada);
  }, []);

  return (
    <div 
      className="home-background"
      style={{
        backgroundImage: `url(/assets/fondo.webp)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
      }}
    >
      <div className="home-config-container">
        <button
          className="home-config-button"
          onClick={() => navigate('/Configuracion')}
          aria-label="Configuración"
        >
          ⚙️
        </button>
      </div>

      <div className="overlay">
        <img src="/assets/Logo_Blanco.webp" alt="Logo" className="logo" />

        <button
          className="main-button"
          onClick={() => navigate('/mesacomanda')}
        >
          INICIAR COMANDA
        </button>

        <button
          className="main-button"
          onClick={() => navigate('/mesa')}
        >
          COMANDAS ACTIVAS
        </button>
      </div>
    </div>
  );
}
