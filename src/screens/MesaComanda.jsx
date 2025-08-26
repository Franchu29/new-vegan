import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MesaComanda.css';

export default function Mesas() {
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [mesaLibreSeleccionada, setMesaLibreSeleccionada] = useState(null);
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mesas, setMesas] = useState([]);

  const navigate = useNavigate();

  // Leer IP guardada localmente o poner IP por defecto
  useEffect(() => {
    const storedIp = localStorage.getItem('API_BASE_URL') || 'http://192.168.0.15:5000';
    setApiBaseUrl(storedIp);
  }, []);

  // Cuando cambia la IP, cargar las mesas
  useEffect(() => {
    if (!apiBaseUrl) return;

    setIsLoading(true);
    fetch(`${apiBaseUrl}/api/mesas`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setMesas(data);
        } else if (Array.isArray(data.mesas)) {
          setMesas(data.mesas);
        } else {
          setMesas([]);
        }
      })
      .catch((err) => {
        console.error('Error al obtener mesas:', err);
        setMesas([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [apiBaseUrl]);

  const handleMesaClick = (mesa) => {
    if (mesa.estado === 'O') {
      setMesaSeleccionada(mesa);
      setMesaLibreSeleccionada(null);
    } else if (mesa.estado === 'L') {
      setMesaLibreSeleccionada(mesa);
      setMesaSeleccionada(null);
    }
  };

  return (
    <div className="mesas-background" style={{ backgroundImage: 'url(/assets/fondo.webp)' }}>
      <div className="mesas-container">
        <div className="mesas-box">
          <h2>Número de Mesas</h2>
        </div>

        {mesaLibreSeleccionada && (
          <div className="mesa-info">
            Mesa libre seleccionada: {mesaLibreSeleccionada.id}
          </div>
        )}

        {mesaSeleccionada && (
          <div className="mesa-info ocupada">
            Mesa {mesaSeleccionada.id} está ocupada
          </div>
        )}

        {isLoading ? (
          <div className="loader">Cargando mesas...</div>
        ) : (
          <div className="mesas-grid">
            {mesas.length > 0 ? (
              mesas.map((mesa) => {
                const disponible = mesa.estado === 'L';
                return (
                  <button
                    key={mesa.id}
                    className={`mesa-button ${disponible ? 'disponible' : 'ocupada'}`}
                    onClick={() => handleMesaClick(mesa)}
                  >
                    Mesa {mesa.id}
                  </button>
                );
              })
            ) : (
              <p>No hay mesas disponibles</p>
            )}
          </div>
        )}

        <div className="bottom-buttons-container">
          <button className="cancel-button" onClick={() => navigate(-1)}>
            Cancelar
          </button>

          <button
            className="advance-button"
            disabled={!mesaLibreSeleccionada}
            onClick={() => {
              if (mesaLibreSeleccionada) {
                navigate('/ingresonombrecliente', {
                  state: { id_mesa: mesaLibreSeleccionada.id },
                });
              }
            }}
          >
            Avanzar
          </button>
        </div>
      </div>
    </div>
  );
}
