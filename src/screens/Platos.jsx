import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getEventos } from '../api/platosApi';
import { loadApiBaseUrl, config } from '../config/config';
import { v4 as uuidv4 } from 'uuid';
import './Platos.css';

export default function Platos() {
  const navigate = useNavigate();
  const location = useLocation();
  const datos = location.state?.datos || {};

  const [eventos, setEventos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(0);
  const elementosPorPagina = 6;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventos = async () => {
      await loadApiBaseUrl();
      const data = await getEventos();

      const keywordsAlFinal = ['Bebestible', 'Café', 'Infusión', 'Smoothie', 'postre'].map(k =>
        k.toLowerCase()
      );

      const eventosOrdenados = [
        ...data.filter(evento =>
          !keywordsAlFinal.some(palabra =>
            evento.nombre.toLowerCase().includes(palabra)
          )
        ),
        ...data.filter(evento =>
          keywordsAlFinal.some(palabra =>
            evento.nombre.toLowerCase().includes(palabra)
          )
        ),
      ];

      setEventos(eventosOrdenados);
      setLoading(false);
    };

    fetchEventos();
  }, []);

  const totalPaginas = Math.ceil(eventos.length / elementosPorPagina);

  const eventosAMostrar = eventos.slice(
    paginaActual * elementosPorPagina,
    (paginaActual + 1) * elementosPorPagina
  );

  return (
    <div
      className="platos-background"
      style={{
        backgroundImage: `url(/assets/fondo.webp)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div className="platos-container">
        <header className="platos-header">
          <h1>Platos</h1>
        </header>

        {loading ? (
          <div className="loader">Cargando...</div>
        ) : (
          <>
            <div className="platos-grid">
              {eventosAMostrar.map(evento => (
                <button
                  key={evento.id}
                  className="plato-item"
                  onClick={() => {
                    const nuevoIdUnico = uuidv4();
                    console.log('Nuevo ID único generado:', nuevoIdUnico);
                    navigate('/platoespecifico', {
                      state: {
                        datos,
                        idEvento: evento.id,
                        nombreEvento: evento.nombre,
                        descripcion: evento.descripcion,
                        precio: evento.precio,
                        foto: evento.foto,
                        idComanda: evento.id_comanda,
                        idUnico: nuevoIdUnico,
                      },
                    });
                  }}
                >
                  <img
                    src={`${config.API_BASE_URL}${evento.foto}`}
                    alt={evento.nombre}
                    className="plato-img"
                  />
                  <span className="plato-nombre">{evento.nombre}</span>
                </button>
              ))}
            </div>

            <div className="pagination">
              <button
                onClick={() => setPaginaActual(p => Math.max(p - 1, 0))}
                disabled={paginaActual === 0}
                className={`page-btn ${paginaActual === 0 ? 'disabled' : ''}`}
              >
                ←
              </button>

              <span className="page-info">
                Página {paginaActual + 1} de {totalPaginas}
              </span>

              <button
                onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas - 1))}
                disabled={paginaActual === totalPaginas - 1}
                className={`page-btn ${paginaActual === totalPaginas - 1 ? 'disabled' : ''}`}
              >
                →
              </button>
            </div>
          </>
        )}

        <button className="cancel-btn" onClick={() => navigate(-1)}>
          Cancelar
        </button>

        <footer className="footer-text">
          Pedido de: {datos.nombre_cliente || ''} para Mesa: {datos.id_mesa || ''}
        </footer>
      </div>
    </div>
  );
}
