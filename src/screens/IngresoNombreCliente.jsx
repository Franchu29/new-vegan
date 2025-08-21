// src/screens/HomeScreen.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './IngresoNombreCliente.css';

export default function HomeScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener id_mesa desde state pasado en navigate (o undefined)
  const id_mesa = location.state?.id_mesa;

  const [nombreCliente, setNombreCliente] = useState('');

  const handleAceptar = () => {
    if (!nombreCliente.trim()) {
      window.alert('Por favor ingrese el nombre del cliente.');
      return;
    }

    const datos = {
      nombre_cliente: nombreCliente,
      id_mesa,
      platos: [],
    };

    navigate('/platos', { state: { datos } });
  };

    return (
    <div
        className="ingreso-nombre-background"
        style={{
        backgroundImage: `url(/assets/fondo.webp)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        }}
    >
        <div className="overlay-IngresoNombreCliente">
        <div className="header">
            <h1>{id_mesa ? `Comanda para Mesa ${id_mesa}` : 'Comanda'}</h1>
        </div>

        <input
            className="input"
            type="text"
            placeholder="Ingrese nombre Cliente"
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
        />

        <div className="footer-IngresoNombreCliente">
            <button className="cancel-button-IngresoNombreCliente" onClick={() => navigate(-1)}>
            Cancelar
            </button>

            <button className="accept-button" onClick={handleAceptar}>
            Aceptar
            </button>
        </div>
        </div>
    </div>
    );
}
