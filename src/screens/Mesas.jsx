import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadApiBaseUrl, config } from '../config/config';
import './Mesas.css';
import MesaList from '../api/MesaList';

export default function Mesas() {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [comandas, setComandas] = useState([]);
  const [loadingComandas, setLoadingComandas] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mesas, setMesas] = useState([]);


  const handleMesaPress = (item) => {
    if (item.estado === 'O') {
      setMesaSeleccionada(item);
      setModalVisible(true);
    }
  };

  useEffect(() => {
    const fetchComandas = async () => {
      if (!mesaSeleccionada) return;
      setLoadingComandas(true);
      try {
        await loadApiBaseUrl();
        const response = await fetch(`${config.API_BASE_URL}/api/comanda/${mesaSeleccionada.id}`);
        const data = await response.json();
        setComandas(data);
      } catch (error) {
        console.error('Error al obtener comandas:', error);
        setComandas([]);
      } finally {
        setLoadingComandas(false);
      }
    };

    if (modalVisible) {
      fetchComandas();
    }
  }, [mesaSeleccionada, modalVisible]);

  const eliminarPlato = async (id_platoxcomanda, ingredientes) => {
    try {
      await loadApiBaseUrl();
      console.log('Eliminando plato con ID:', id_platoxcomanda);
      console.log('Ingredientes a eliminar:', ingredientes);

      // 1. Eliminar ingredientes
      for (const ing of ingredientes) {
        const resIng = await fetch(`${config.API_BASE_URL}/api/comanda/plato/eliminar_ingrediente`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_platoxcomandaxingrediente: ing.id_platoxcomandaxingrediente }),
        });
        if (!resIng.ok) {
          console.error('Error al eliminar ingrediente', await resIng.json());
          return;
        }
      }

      // 2. Eliminar plato
      const resPlato = await fetch(`${config.API_BASE_URL}/api/comanda/eliminar_plato`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idplatoxcomanda: id_platoxcomanda }),
      });

      if (resPlato.ok) {
        setComandas(prev => {
          const platosActualizados = prev.platos.filter(p => p.id_platoxcomanda !== id_platoxcomanda);

          // Recalcular total
          const nuevoPrecio = platosActualizados.reduce((total, p) => total + p.precio, 0);

          // Aplicar descuento de burritos si es necesario
          const burritoCount = platosActualizados.filter(p =>
            p.nombre?.toLowerCase().includes('burrito')
          ).length;
          const descuentoBurritos = Math.floor(burritoCount / 2) * 800;

          return {
            ...prev,
            platos: platosActualizados,
            precio_final: nuevoPrecio - descuentoBurritos
          };
        });
      }
    } catch (err) {
      console.error('Error al eliminar plato:', err);
    }
  };

  const finalizarComanda = async () => {
    if (!comandas.id) return;

    try {
      await loadApiBaseUrl();
      const response = await fetch(`${config.API_BASE_URL}/api/comanda/${comandas.id}/finalizar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        alert('Comanda finalizada correctamente');
        setModalVisible(false);
        setMesaSeleccionada(null);
        navigate('/');
      } else {
        alert('Error al finalizar la comanda');
      }
    } catch (error) {
      console.error('Error en PUT:', error);
      alert('Error de red al finalizar la comanda');
    }
  };

  const datos = {
    nombre_cliente: comandas.nombre_cliente,
    id_mesa: mesaSeleccionada?.id,
    platos: [],
  };

  //Calcular descuento de burritos
  const burritoCount = comandas.platos?.filter(
    (plato) => plato.nombre?.toLowerCase().includes('burrito')
  ).length || 0;

  const descuentoBurritos = Math.floor(burritoCount / 2) * 800;

  const renderMesa = ({ item }) => {
  const isDisponible = item.estado === "L";

  return (
    <button
        className={`mesaButton-mesas ${isDisponible ? 'disponible' : 'ocupada'}`}
        style={{
        backgroundColor: isDisponible ? '#ccc' : '#555',
        }}
        onClick={() => handleMesaPress(item)}
    >
        Mesa {item.id}
    </button>
    );
  };

  return (
  <MesaList>
    {({ mesas, isLoading }) => (
      <div
        className="background-mesas"
        style={{
          backgroundImage: `url('/assets/fondo.webp')`,
          backgroundSize: 'cover',
          minHeight: '100vh',
        }}
      >
        <div className="container-mesas">
          <div className="box-mesas">
            <h2 className="text-mesas">Número de Mesas</h2>
          </div>

          {isLoading ? (
            <div className="spinner">Cargando...</div>
          ) : mesas.length > 0 ? (
            <div className="grid-mesas">
              {mesas.map((item, index) => (
                <div key={item.id || index}>{renderMesa({ item })}</div>
              ))}
            </div>
          ) : (
            <p className="empty-text">No hay mesas disponibles</p>
          )}

          {/* Modal */}
          {modalVisible && (
            <div className="modalOverlay-mesas">
              <div className="modalContent-mesas">
                <div className="modalScrollContent-mesas">
                    <div>
                      <button className="closeButton-mesas" onClick={() => setModalVisible(false)}>
                        ✕
                      </button>
                    </div>
                    <h3>Mesa {mesaSeleccionada?.id} está ocupada</h3>

                    {comandas && comandas.id ? (
                      <div className="modalSection-mesas">
                        <p><strong>Cliente:</strong> {comandas.nombre_cliente}</p>
                        <p><strong>Fecha:</strong> {new Date(comandas.fecha).toLocaleString()}</p>
                        <p><strong>Tipo de Consumo:</strong> {comandas.tipo_consumo === 'L' ? 'Para Llevar' : 'Para Servir'}</p>
                        <p><strong>Platos:</strong></p>

                        {[...comandas.platos]
                          .sort((a, b) => {
                            const esBebida = (nombre) => {
                              if (!nombre) return false;
                              const n = nombre.toLowerCase();
                              return (
                                n.includes('bebestible') ||
                                n.includes('café') ||
                                n.includes('postre') ||
                                n.includes('infusión') ||
                                n.includes('smoothie')
                              );
                            };

                            const aEsBebida = esBebida(a.nombre);
                            const bEsBebida = esBebida(b.nombre);

                            if (aEsBebida === bEsBebida) return 0;
                            return aEsBebida ? 1 : -1; // Bebidas al final
                          })
                          .map((plato, i) => (
                            <div key={i} className="platoCard-mesas">
                              <p><strong>{plato.nombre}</strong> - ${plato.precio}</p>
                              {plato.foto && (
                                <img
                                  src={`${config.API_BASE_URL}${plato.foto}`}
                                  alt={plato.nombre}
                                  className="platoImage-mesas"
                                />
                              )}
                              {plato.ingredientes.length > 0 && (
                                <>
                                  <p><strong>Ingredientes:</strong></p>
                                  <ul>
                                    {plato.ingredientes.map((ing, j) => (
                                      <li key={j}>- {ing.nombre}</li>
                                    ))}
                                  </ul>
                                </>
                              )}
                              {plato.comentario?.trim() && (
                                <>
                                  <p><strong>Comentario:</strong></p>
                                  <p>{plato.comentario}</p>
                                </>
                              )}

                              <button
                                className="deleteButton-mesas"
                                onClick={() => eliminarPlato(plato.id_platoxcomanda, plato.ingredientes)}
                              >
                                🗑️ Eliminar
                              </button>
                              <hr />
                            </div>
                        ))}

                        {descuentoBurritos > 0 && (
                          <p><strong>Descuento Burritos:</strong> - ${descuentoBurritos}</p>
                        )}
                        <p><strong>Total a pagar:</strong> ${comandas.precio_final}</p>

                        <div className="modalButton-mesas">
                          <button
                            className="modalButton-mesas"
                            style={{ backgroundColor: '#00A99D' }}
                            onClick={() => {
                              setModalVisible(false);
                              navigate('/platos', { state: { datos } });
                            }}
                          >
                            Agregar Plato
                          </button>

                          <button
                            className="modalButton-mesas"
                            style={{ backgroundColor: 'red' }}
                            onClick={finalizarComanda}
                          >
                            Finalizar
                          </button>
                        </div>

                        <button
                          className="modalButton-mesas modalButton-centered"
                          style={{ backgroundColor: '#007AFF', marginTop: 10 }}
                          onClick={async () => {
                            try {
                              const response = await fetch(`${config.API_BASE_URL}/api/imprimir_comanda/${comandas.id}`);
                              if (response.ok) {
                                alert('Comanda enviada a impresión');
                              } else {
                                alert('No se pudo imprimir la comanda');
                              }
                            } catch (err) {
                              alert('Error de red al imprimir la comanda');
                            }
                          }}
                        >
                          Imprimir comanda
                        </button>
                      </div>
                    ) : (
                      <p>No hay comandas.</p>
                    )}
                </div>
              </div>
            </div>
          )}

          <button className="cancelButton-mesas" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </div>
    )}
  </MesaList>
);
}
