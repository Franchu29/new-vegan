import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadApiBaseUrl, config } from '../config/config';
import { v4 as uuidv4 } from 'uuid';
import './ResumenPedido.css';

export default function ResumenPedidoWeb() {
  const location = useLocation();
  const navigate = useNavigate();
  const [datos, setDatos] = useState(location.state?.datos || {});

  // 1. Contar burritos
  const burritoCount = datos.platos?.filter(
    (item) => item.nombreEvento?.toLowerCase().includes('burrito')
  ).length || 0;

  // 2. Calcular descuento
  const descuentoBurritos = Math.floor(burritoCount / 2) * 800;
  // 3. Calcular total
  const totalSinDescuento = datos.platos?.reduce((sum, item) => sum + item.precio, 0) || 0;
  const total = totalSinDescuento - descuentoBurritos;

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [tipoConsumo, setTipoConsumo] = useState('S');
  const idUnico = uuidv4();

  const generarComanda = async () => {
    if (!datos || !datos.platos || datos.platos.length === 0) return;

    setIsSubmitting(true);

    try {
        await loadApiBaseUrl();
        let comandaId = null;
        const { id_mesa, nombre_cliente, platos } = datos;

    if (!id_mesa || !nombre_cliente || !platos || platos.length === 0) {
        throw new Error('Faltan datos de la mesa o del cliente');
        }

        // ✅ 0. Verificar estado de la mesa antes de crear la comanda
        try {
        console.log('Obteniendo estado de la mesa:', id_mesa);
        const response = await fetch(`${config.API_BASE_URL}/api/mesa/${id_mesa}`);
        if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'No se pudo obtener el estado de la mesa');
        }

        const estado_mesa = await response.json();
        console.log('Estado de la mesa:', estado_mesa);

        if (estado_mesa.estado === 'L') {
        // Mesa libre: crear comanda
        const comandaResponse = await fetch(`${config.API_BASE_URL}/api/crear_comanda`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            id_mesa,
            nombre_cliente,
            estado: 'E',
            precio_final: total,
            tipo_consumo: tipoConsumo,
            }),
        });

        if (!comandaResponse.ok) {
            const errorData = await comandaResponse.json().catch(() => ({}));
            throw new Error(errorData.error || 'Error al crear comanda');
        }

        const comandaData = await comandaResponse.json();
        comandaId = comandaData.id_comanda;

        // 2. Agregar cada plato
        for (const item of platos) {
          const platoResponse = await fetch(`${config.API_BASE_URL}/api/comanda/${comandaId}/agregar_plato`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id_plato: item.idEvento,
              precio: item.precio,
              comentario: item.comentario || '',
            }),
          });

          if (!platoResponse.ok) {
            const errorData = await platoResponse.json().catch(() => ({}));
            throw new Error(errorData.error || 'Error al agregar plato');
          }

          const platoData = await platoResponse.json();
          console.log('Respuesta del servidor al agregar plato:', platoData);
          const idPlatoxComanda = platoData.idplatoxcomanda;
          console.log('ID PlatoxComanda extraído:', idPlatoxComanda);

          // 3. Agregar ingredientes (si hay)
          const ingredientes = (item.ingredientesSeleccionados || []).map(ing => ({
            id_ingrediente: ing.id,
            precio: ing.precio || null,
          }));

          if (ingredientes.length > 0) {
            console.log('Intentando agregar ingredientes a PlatoxComanda ID:', idPlatoxComanda);
            console.log('Ingredientes a agregar:', ingredientes);
            
            if (!idPlatoxComanda) {
              throw new Error('No se pudo obtener el ID del plato en la comanda');
            }
            
            const ingredientesResponse = await fetch(
              `${config.API_BASE_URL}/api/comanda/plato/${idPlatoxComanda}/agregar_ingredientes`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredientes }),
              }
            );

            if (!ingredientesResponse.ok) {
              const errorData = await ingredientesResponse.json().catch(() => ({}));
              throw new Error(errorData.error || 'Error al agregar ingredientes');
            }
          }
        }

        navigate('/mesa', { state: { mesaId: datos.id_mesa } }); // Navegar a la mesa después de crear la comanda

        } else if (estado_mesa.estado === 'O') {
          // obtener comanda existente
          const comandaExistenteResponse = await fetch(`${config.API_BASE_URL}/api/comanda/${id_mesa}`);
            if (!comandaExistenteResponse.ok) {
              const errorData = await comandaExistenteResponse.json().catch(() => ({}));
              throw new Error(errorData.error || 'No se pudo obtener la comanda actual');
            }
          const comandaExistente = await comandaExistenteResponse.json();
          comandaId = comandaExistente.id;

          // Ahora agregas aquí los platos nuevos:
          for (const item of platos) {
            const platoResponse = await fetch(`${config.API_BASE_URL}/api/comanda/${comandaId}/agregar_plato`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id_plato: item.idEvento,
                precio: item.precio,
                comentario: item.comentario || '',
              }),
            });

            if (!platoResponse.ok) {
              const errorData = await platoResponse.json().catch(() => ({}));
              throw new Error(errorData.error || 'Error al agregar plato');
            }

            const platoData = await platoResponse.json();
            const idPlatoxComanda = platoData.idplatoxcomanda;

            // agregar ingredientes si los hay
            const ingredientes = (item.ingredientesSeleccionados || []).map((ing) => ({
              id_ingrediente: ing.id,
              precio: ing.precio || null,
            }));

            if (ingredientes.length > 0 && idPlatoxComanda) {
              const ingredientesResponse = await fetch(
                `${config.API_BASE_URL}/api/comanda/plato/${idPlatoxComanda}/agregar_ingredientes`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ingredientes }),
                }
              );

              if (!ingredientesResponse.ok) {
                const errorData = await ingredientesResponse.json().catch(() => ({}));
                throw new Error(errorData.error || 'Error al agregar ingredientes');
              }
            }
          }
          // navegar al home o donde quieras
          navigate('/');
        }
        else {
        throw new Error('Estado de mesa no reconocido');
        }
    } catch (error) {
        console.error('Error:', error.message);
        window.alert(`Error: ${error.message}`);
    }
    }
    catch (error) {
        console.error('Error al generar comanda:', error);
        window.alert(`Error al generar comanda: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
  }
  const eliminarPlato = (index) => {
    const nuevosPlatos = [...(datos.platos || [])];
    nuevosPlatos.splice(index, 1);
    setDatos({ ...datos, platos: nuevosPlatos });
  };
  return (
    <div
      className="safeArea-ResumenPedido"
      style={{
        backgroundImage: `url('/assets/fondo.webp')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
    >
      <div className="container-ResumenPedido">
        <div className="header-ResumenPedido">
          <p className="headerText-ResumenPedido">
            Pedido de: <strong>{datos.nombre_cliente}</strong> para la mesa <strong>{datos.id_mesa}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
          <button
            className={`tipoConsumoButton-ResumenPedido ${tipoConsumo === 'S' ? 'selected' : ''}`}
            onClick={() => setTipoConsumo('S')}
          >
            Para servir
          </button>
          <button
            className={`tipoConsumoButton-ResumenPedido ${tipoConsumo === 'L' ? 'selected' : ''}`}
            onClick={() => setTipoConsumo('L')}
          >
            Para llevar
          </button>
        </div>

        <div className="scrollContainer-ResumenPedido">
          {datos.platos?.map((item, index) => (
            <div className="card-ResumenPedido" key={index}>
              <img
                src={`${config.API_BASE_URL}${item.foto}`}
                alt="Plato"
                className="itemImage-ResumenPedido"
              />
              <div className="infoContainer-ResumenPedido">
                <p className="nombrePlatoText-ResumenPedido">{item.nombreEvento}</p>

                <p className="label-ResumenPedido">Comentario:</p>
                <p className="value-ResumenPedido">{item.descripcion?.trim() || 'Sin Comentario'}</p>

                <p className="label-ResumenPedido">Precio:</p>
                <p className="value-ResumenPedido">${item.precio}</p>

                <p className="label-ResumenPedido">Ingredientes:</p>
                {item.ingredientesSeleccionados?.length > 0 ? (
                  item.ingredientesSeleccionados.map((ing, i) => (
                    <div key={i} className="ingredienteItem-ResumenPedido">
                      <span className="ingredienteNombre-ResumenPedido">{ing.nombre}</span>
                    </div>
                  ))
                ) : (
                  <p className="noIngredientsText-ResumenPedido">No hay ingredientes seleccionados.</p>
                )}

                {item.comentario?.trim() && (
                  <>
                    <p className="label-ResumenPedido">Comentario:</p>
                    <p className="value-ResumenPedido">{item.comentario}</p>
                  </>
                )}

                <div className="buttonContainer-ResumenPedido">
                  <button
                    className="editButton-ResumenPedido"
                    onClick={() => navigate('/editarplato', {
                      state: { plato: item, mesa: datos.id_mesa, cliente: datos.nombre_cliente, datos }
                    })}
                  >
                    ✏️
                  </button>
                  <button
                    className="deleteButton-ResumenPedido"
                    onClick={() => eliminarPlato(index)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            className="botonMas-ResumenPedido"
            onClick={() => navigate('/platos', { state: { datos } })}
          >
            +
          </button>
        </div>

        <div className="footer-ResumenPedido">
          {descuentoBurritos > 0 && (
            <div className="totalContainer-ResumenPedido">
              <span className="totalLabel-ResumenPedido" style={{ color: '#FFD700' }}>Descuento Burritos:</span>
              <span className="totalAmount-ResumenPedido" style={{ color: '#FFD700' }}>- ${descuentoBurritos}</span>
            </div>
          )}
          <div className="totalContainer-ResumenPedido">
            <span className="totalLabel-ResumenPedido">Total:</span>
            <span className="totalAmount-ResumenPedido">${total.toFixed(0)}</span>
          </div>

          <div className="footerButtons-ResumenPedido">
            <button className="cancelButton-ResumenPedido" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button
              className="confirmButton-ResumenPedido"
              onClick={generarComanda}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Generar Comanda'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}