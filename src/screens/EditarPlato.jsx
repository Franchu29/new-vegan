import React, { useState, useEffect, useRef } from 'react';
import { loadApiBaseUrl, config } from '../config/config';
import { useNavigate, useLocation  } from 'react-router-dom';

export default function EditarPlato({}) {
  const location = useLocation();
  const { plato, mesa, cliente, datos } = location.state || {};
  const {
  nombreEvento,
  foto,
  descripcion,
  idUnico,
  precio: precioBase,
} = plato || {};

  const id_mesa = mesa;
  const nombre_cliente = cliente;
  const [ingredientesData, setIngredientesData] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState({});
  const [proteinaSeleccionada, setProteinaSeleccionada] = useState(null);
  const [baseChorrillanaSeleccionada, setBaseChorrillanaSeleccionada] = useState(null);
  const [precioTotal, setPrecioTotal] = useState(precioBase || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [esTipoEspecial, setEsTipoEspecial] = useState(false);
  const [esChorrillana, setEsChorrillana] = useState(false);
  const [comentario, setComentario] = useState('');
  const idEvento = plato?.idEvento ?? null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const hasLoadedInitialIngredients = useRef(false);

  useEffect(() => {
    console.log('Plato recibido para editar:', plato);
    console.log('Lista de platos completa (datos.platos):', datos?.platos);
    console.log('👉 idUnico del plato:', plato?.idUnico);
    console.log('👉 datos recibidos:', datos);
    console.log('👉 platos en datos:', datos?.platos);
  }, []);

useEffect(() => {
  if (!datos || !plato || hasLoadedInitialIngredients.current) return;

  const platoGuardado = datos.platos?.find(p => p.idUnico === plato.idUnico);

  if (platoGuardado && platoGuardado.ingredientesSeleccionados) {
    const seleccionInicial = {};

    platoGuardado.ingredientesSeleccionados.forEach(ingrediente => {
      const grupoId = ingrediente.id_tipoingrediente;
      if (!seleccionInicial[grupoId]) seleccionInicial[grupoId] = [];
      seleccionInicial[grupoId].push(ingrediente);
    });

    setSelectedIngredients(seleccionInicial);

    const proteina = platoGuardado.ingredientesSeleccionados.find(i => i.es_principal);
    if (proteina) setProteinaSeleccionada(String(proteina.id));

    const baseChorrillana = platoGuardado.ingredientesSeleccionados.find(i => i.es_base_chorrillana);
    if (baseChorrillana) setBaseChorrillanaSeleccionada(String(baseChorrillana.id));

    hasLoadedInitialIngredients.current = true; // ✅ evitar recarga
  }
}, [datos, plato]);

useEffect(() => {
  const fetchIngredientes = async () => {

    try {
      await loadApiBaseUrl();
      const response = await fetch(`${config.API_BASE_URL}/api/reglas_ingredientes/${idEvento}`);
      if (!response.ok) throw new Error('Error al obtener los ingredientes');

      const responseData = await response.json();

      setEsTipoEspecial(responseData.es_tipo_especial || false);
      setEsChorrillana(responseData.es_chorrillana || false);
      const reglas = Array.isArray(responseData.reglas) ? responseData.reglas : [];
      setIngredientesData(reglas);

      setSelectedIngredients(prevSelected => {
        if (prevSelected && Object.keys(prevSelected).length > 0) {
          return prevSelected;
        }

        // Si no hay selección previa, inicializar ingredientes por defecto
        const initialSelection = {};
        let proteinaInicial = null;
        let baseChorrillanaInicial = null;

        reglas.forEach((grupo) => {
          if (grupo && grupo.id_tipoingrediente) {
            initialSelection[grupo.id_tipoingrediente] = [];

            if (
              responseData.es_tipo_especial &&
              Array.isArray(grupo.ingredientes) &&
              grupo.ingredientes.some((i) => i.es_principal)
            ) {
              const primeraProteina = grupo.ingredientes.find((i) => i.es_principal);
              if (primeraProteina) {
                initialSelection[grupo.id_tipoingrediente] = [primeraProteina];
                proteinaInicial = String(primeraProteina.id);
              }
            }

            if (
              responseData.es_chorrillana &&
              Array.isArray(grupo.ingredientes) &&
              grupo.ingredientes.some((i) => i.es_base_chorrillana)
            ) {
              const primeraBase = grupo.ingredientes.find((i) => i.es_base_chorrillana);
              if (primeraBase) {
                initialSelection[grupo.id_tipoingrediente] = [primeraBase];
                baseChorrillanaInicial = String(primeraBase.id);
              }
            }
          }
        });

        setProteinaSeleccionada(proteinaInicial);
        setBaseChorrillanaSeleccionada(baseChorrillanaInicial);
        hasLoadedInitialIngredients.current = true; // ✅ lo marcamos como cargado
        return initialSelection;
      });

    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (idEvento) {
    fetchIngredientes();
  } else {
    setError('No se proporcionó ID de evento');
    setLoading(false);
  }
}, [idEvento]);
  
  const handleSelectIngredient = (grupoId, ingrediente) => {
    if (!ingrediente || !grupoId) return;

    const grupo = ingredientesData.find(g => g.id_tipoingrediente === grupoId);
    if (!grupo) return;

    // Si es tipo especial y el ingrediente es principal (proteína)
    if (esTipoEspecial && ingrediente.es_principal) {
        setProteinaSeleccionada(String(ingrediente.id));
        setSelectedIngredients(prev => ({
        ...prev,
        [grupoId]: [ingrediente],
        }));
        return;
    }

    // Si es chorrillana y el ingrediente es base (2p o 4p)
    if (esChorrillana && ingrediente.es_base_chorrillana) {
        setBaseChorrillanaSeleccionada(String(ingrediente.id));
        setSelectedIngredients(prev => ({
        ...prev,
        [grupoId]: [ingrediente],
        }));
        return;
    }

    // Manejamos selección o deselección normal
    setSelectedIngredients(prev => {
        const currentSelected = [...(prev[grupoId] || [])];
        const index = currentSelected.findIndex(item => item.id === ingrediente.id);

        if (index !== -1) {
        // Deselección
        if (
            grupo.obligatorio &&
            grupo.max_seleccion === 1 &&
            currentSelected.length === 1
        ) {
            // No permitir quitar el único seleccionado en grupos obligatorios
            return { ...prev, [grupoId]: [ingrediente] };
        } else {
            // Quitar ingrediente
            currentSelected.splice(index, 1);
        }
        } else {
        // Selección
        if (grupo.max_seleccion === 1) {
            return { ...prev, [grupoId]: [ingrediente] };
        } else if (currentSelected.length < (grupo.max_seleccion || 1)) {
            currentSelected.push(ingrediente);
        } else {
            // Ya alcanzado el máximo
            return prev;
        }
        }

        return { ...prev, [grupoId]: currentSelected };
    });
  };

  const isIngredientSelected = (grupoId, ingredienteId) => {
    return selectedIngredients[grupoId]?.some(item => String(item.id) === String(ingredienteId));
  };

  const validateSelection = () => {
    if (!ingredientesData || !Array.isArray(ingredientesData)) {
      console.warn("❌ Ingredientes no válidos");
      return false;
    }

    for (const grupo of ingredientesData) {
      if (
        grupo.obligatorio &&
        (!selectedIngredients[grupo.id_tipoingrediente] ||
          selectedIngredients[grupo.id_tipoingrediente].length === 0)
      ) {
        console.warn(`❌ Falta selección en grupo obligatorio: ${grupo.tipo_ingrediente_nombre}`);
        return false;
      }
    }
    return true;
  };

useEffect(() => {
  let total = 0;

  if (!selectedIngredients || typeof selectedIngredients !== 'object') {
    setPrecioTotal(total);
    return;
  }

  Object.values(selectedIngredients).forEach(ingredientesGrupo => {
    if (!Array.isArray(ingredientesGrupo)) return;

    ingredientesGrupo.forEach(ingrediente => {
      if (!ingrediente) return;

      if (esTipoEspecial) {
        if (ingrediente.es_principal) {
          total += parseInt(ingrediente.precio || 0);
        } else {
          if (proteinaSeleccionada && ingrediente.precios && ingrediente.precios[proteinaSeleccionada]) {
            total += parseInt(ingrediente.precios[proteinaSeleccionada]);
          } else if (ingrediente.precio) {
            total += parseInt(ingrediente.precio);
          }
        }
      } else if (esChorrillana) {
        if (ingrediente.es_base_chorrillana) {
          total += parseInt(ingrediente.precio || 0);
        } else {
          if (baseChorrillanaSeleccionada && ingrediente.precios && ingrediente.precios[baseChorrillanaSeleccionada]) {
            total += parseInt(ingrediente.precios[baseChorrillanaSeleccionada]);
          } else if (ingrediente.precio) {
            total += parseInt(ingrediente.precio);
          }
        }
      } else {
        total += parseInt(ingrediente.precio || 0);
      }
    });
  });

  setPrecioTotal(total);
}, [selectedIngredients, proteinaSeleccionada, baseChorrillanaSeleccionada, esTipoEspecial, esChorrillana]);

    const renderIngredientes = () => {
    if (loading) {
    return (
        <div style={{ textAlign: 'center', padding: 20 }}>
        <div
            style={{
            margin: '0 auto 10px',
            border: '4px solid #ccc',
            borderTop: '4px solid #00ff00',
            borderRadius: '50%',
            width: 40,
            height: 40,
            animation: 'spin 1s linear infinite',
            }}
        />
        <p style={{ color: '#00ff00' }}>Cargando...</p>

        <style>
            {`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            `}
        </style>
        </div>
    );
    }
    
        if (error) {
        return <p style={{ color: 'red', fontWeight: 'bold', margin: '20px 0' }}>{error}</p>;
        }

        if (!ingredientesData || !Array.isArray(ingredientesData)) {
        return <p style={{ color: 'red', fontWeight: 'bold', margin: '20px 0' }}>Formato de datos incorrecto</p>;
        }

        if (ingredientesData.length === 0) {
        return <p style={{ color: '#999', margin: '20px 0' }}>No hay ingredientes disponibles</p>;
        }
    
        return ingredientesData.map((grupo, index) => (
        <div
            key={`${grupo.id_tipoingrediente}-${index}`}
            style={{
            marginBottom: 30,
            padding: 10,
            border: '1px solid #444',
            borderRadius: 10,
            backgroundColor: '#2a2a2a',
            }}
        >
            <p style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>
            {grupo.tipo_ingrediente_nombre}
            {grupo.obligatorio ? ' (Obligatorio)' : ''}
            </p>

            <p style={{ fontSize: 14, marginBottom: 10, color: '#ccc' }}>
            Seleccionados: {selectedIngredients[grupo.id_tipoingrediente]?.length || 0}/
            {grupo.max_seleccion || 1}
            </p>

            {grupo.ingredientes?.map((ingrediente) => {
            let precioMostrar = ingrediente.precio;

            if (
                esTipoEspecial &&
                !ingrediente.es_principal &&
                proteinaSeleccionada &&
                ingrediente.precios
            ) {
                precioMostrar =
                ingrediente.precios[proteinaSeleccionada] || ingrediente.precio;
            } else if (
                esChorrillana &&
                !ingrediente.es_base_chorrillana &&
                baseChorrillanaSeleccionada &&
                ingrediente.precios
            ) {
                precioMostrar =
                ingrediente.precios[baseChorrillanaSeleccionada] || ingrediente.precio;
            }

            const isSelected = isIngredientSelected(grupo.id_tipoingrediente, ingrediente.id);

            return (
                <button
                key={ingrediente.id}
                onClick={() => handleSelectIngredient(grupo.id_tipoingrediente, ingrediente)}
                style={{
                    backgroundColor: isSelected ? '#4caf50' : '#333',
                    color: '#fff',
                    padding: '10px',
                    marginBottom: '8px',
                    border: '1px solid #555',
                    borderRadius: 8,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                }}
                >
                <span>{ingrediente.nombre}</span>
                {precioMostrar !== null && (
                    <span style={{ fontSize: 14 }}>
                    {precioMostrar !== undefined ? `+$${precioMostrar}` : ''}
                    </span>
                )}
                </button>
            );
            })}

            {grupo.obligatorio &&
            (!selectedIngredients[grupo.id_tipoingrediente] ||
                selectedIngredients[grupo.id_tipoingrediente].length === 0) && (
                <p style={{ color: 'red', fontSize: 14, marginTop: 8 }}>
                Debes seleccionar al menos 1 ingrediente
                </p>
            )}
        </div>
        ));
    };

  const handleAdvance = () => {
      if (!validateSelection()) {
        window.alert('Error', 'Debes completar todas las selecciones obligatorias');
        return;
      }
    
      if (!id_mesa || !nombre_cliente) {
        window.alert('Error', 'Faltan datos de mesa o cliente');
        return;
      }
    
      const ingredientesSeleccionadosParaEnviar = [];
      for (const grupoId in selectedIngredients) {
        if (Array.isArray(selectedIngredients[grupoId])) {
          ingredientesSeleccionadosParaEnviar.push(...selectedIngredients[grupoId]);
        }
      }
    
      const nuevaSeleccion = {
        idUnico,
        idEvento,
        nombreEvento,
        nombre_cliente,
        id_mesa,
        foto,
        precio: precioTotal,
        descripcion,
        ingredientesSeleccionados: ingredientesSeleccionadosParaEnviar,
        comentario
      };
    
      const datosAnteriores = datos || {
        nombre_cliente,
        id_mesa,
        platos: []
      };
    
      const platosActualizados = (datosAnteriores.platos || []).map(platoExistente => {
        if (platoExistente.idUnico === idUnico) {
          return nuevaSeleccion; // reemplaza si coincide
        }
        return platoExistente;
      });

      const yaExiste = datosAnteriores.platos?.some(p => p.idUnico === idUnico);

      const datosActualizados = {
        ...datosAnteriores,
        platos: yaExiste
          ? platosActualizados
          : [...(datosAnteriores.platos || []), nuevaSeleccion]
      };
    
      navigate('/resumenpedido', { state: { datos: datosActualizados } });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#222', color: '#fff', padding: 20 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ paddingTop: 40 }}>
            <h1 style={{ fontSize: '24px', marginBottom: 20 }}>{nombreEvento}</h1>

            {foto ? (
            <img
                src={`${config.API_BASE_URL}${foto}`}
                alt="Plato"
                style={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'cover',
                borderRadius: 10,
                marginBottom: 20,
                }}
            />
            ) : (
            <p style={{ color: '#ccc' }}>No hay imagen disponible</p>
            )}

            {descripcion && (
            <p style={{ fontSize: 16, marginBottom: 20 }}>{descripcion}</p>
            )}

            <p style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 20 }}>
            Precio total: ${precioTotal}
            </p>

            <div style={{ marginBottom: 30 }}>
            <h2 style={{ fontSize: 18 }}>Personaliza tu plato</h2>
            {renderIngredientes()}
            </div>

            <div style={{ marginBottom: 30 }}>
            <h2 style={{ fontSize: 18 }}>Comentarios adicionales</h2>
            <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                placeholder="Escribe tus observaciones aquí..."
                style={{
                width: '100%',
                padding: 10,
                fontSize: 16,
                borderRadius: 8,
                border: '1px solid #ccc',
                resize: 'vertical',
                }}
            />
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button
                onClick={() => window.history.back()}
                disabled={isSubmitting}
                style={{
                flex: 1,
                backgroundColor: 'red',
                color: '#fff',
                padding: '12px 20px',
                fontSize: 16,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
                }}
            >
                Cancelar
            </button>

            <button
                onClick={handleAdvance}
                disabled={isSubmitting}
                style={{
                flex: 1,
                backgroundColor: 'green',
                color: '#fff',
                padding: '12px 20px',
                fontSize: 16,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
                }}
            >
                Avanzar
            </button>
            </div>

            <div style={{ textAlign: 'center' }}>
            <p>Pedido de: {nombre_cliente}</p>
            <p>Mesa: {id_mesa}</p>
            </div>
        </div>
        </div>
    </div>
    );
}
