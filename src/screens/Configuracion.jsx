import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Configuracion.css';

export default function Configuracion() {
  const [ip, setIp] = useState('');
  const [usandoValorPorDefecto, setUsandoValorPorDefecto] = useState(false);
  const navigate = useNavigate();

  const VALOR_POR_DEFECTO = 'http://192.168.4.86:5000';

  useEffect(() => {
    const ipGuardada = localStorage.getItem('API_BASE_URL');

    if (ipGuardada) {
      setIp(ipGuardada);
    } else {
      localStorage.setItem('API_BASE_URL', VALOR_POR_DEFECTO);
      setIp(VALOR_POR_DEFECTO);
      setUsandoValorPorDefecto(true);
    }
  }, []);

  const guardarIP = () => {
    if (!ip.startsWith('http://') && !ip.startsWith('https://')) {
      alert('La IP debe comenzar con http:// o https://');
      return;
    }

    localStorage.setItem('API_BASE_URL', ip);
    alert(`Nueva IP guardada: ${ip}`);
    setUsandoValorPorDefecto(false);
  };

  const restablecerIP = () => {
    localStorage.setItem('API_BASE_URL', VALOR_POR_DEFECTO);
    setIp(VALOR_POR_DEFECTO);
    setUsandoValorPorDefecto(true);
    alert(`IP restablecida a valor por defecto: ${VALOR_POR_DEFECTO}`);
  };

  return (
    <div
      className="config-form-background"
      style={{
        backgroundImage: `url(/assets/fondo.webp)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div className="config-form-container">
        <h2>Dirección IP del backend:</h2>

        {usandoValorPorDefecto && (
          <div className="mensaje-aviso">
            <p><strong>Usando IP por defecto:</strong> {ip}</p>
          </div>
        )}

        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          className="config-input"
        />

        <div className="buttons-row">
          <button className="config-cancel-button" onClick={() => navigate('/')}>
            Cancelar
          </button>
          <button className="config-save-button" onClick={guardarIP}>
            Guardar
          </button>
          <button className="config-reset-button" onClick={restablecerIP}>
            Restablecer IP
          </button>
        </div>
      </div>
    </div>
  );
}
