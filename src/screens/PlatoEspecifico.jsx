import React, { useState, useEffect } from 'react';
import { loadApiBaseUrl, config } from '../config/config';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useLocation } from 'react-router-dom';
import './PlatoEspecifico.css';

export default function PlatoEspecificoWeb() {
  const navigate = useNavigate();
  const location = useLocation();
  const { datos, idEvento, nombreEvento, descripcion, precio: precioBase, foto, idUnico: propIdUnico } = location.state || {};
  const { nombre_cliente, id_mesa } = datos || {};
  const idUnico = propIdUnico || uuidv4();

  const [ingredientesData, setIngredientesData] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState({});
  const [proteinaSeleccionada, setProteinaSeleccionada] = useState(null);
  const [baseChorrillanaSeleccionada, setBaseChorrillanaSeleccionada] = useState(null);
  const [precioTotal, setPrecioTotal] = useState(precioBase || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [esTipoEspecial, setEsTipoEspecial] = useState(false);
  const [esChorrillana, setEsChorrillana] = useState(false);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    const fetchIngredientes = async () => {
      try {
        await loadApiBaseUrl();
        const response = await fetch(`${config.API_BASE_URL}/api/reglas_ingredientes/${idEvento}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Error al obtener los ingredientes');
        }
        const responseData = await response.json();

        setEsTipoEspecial(responseData.es_tipo_especial || false);
        setEsChorrillana(responseData.es_chorrillana || false);
        const reglas = Array.isArray(responseData.reglas) ? responseData.reglas : [];
        setIngredientesData(reglas);

        const initialSelection = {};
        let proteinaInicial = null;
        let baseChorrillanaInicial = null;

        reglas.forEach(grupo => {
          if (grupo && grupo.id_tipoingrediente) {
            initialSelection[grupo.id_tipoingrediente] = [];

            if (responseData.es_tipo_especial && grupo.ingredientes?.some(i => i.es_principal)) {
              const primeraProteina = grupo.ingredientes.find(i => i.es_principal);
              if (primeraProteina) {
                initialSelection[grupo.id_tipoingrediente] = [primeraProteina];
                proteinaInicial = primeraProteina.id.toString();
              }
            }

            if (responseData.es_chorrillana && grupo.ingredientes?.some(i => i.es_base_chorrillana)) {
              const primeraBase = grupo.ingredientes.find(i => i.es_base_chorrillana);
              if (primeraBase) {
                initialSelection[grupo.id_tipoingrediente] = [primeraBase];
                baseChorrillanaInicial = primeraBase.id.toString();
              }
            }

            if (grupo.obligatorio && !grupo.ingredientes?.some(i => i.es_base_chorrillana) && !grupo.ingredientes?.some(i => i.es_principal)) {
              const primerIngrediente = grupo.ingredientes?.[0];
              if (primerIngrediente) {
                initialSelection[grupo.id_tipoingrediente] = [primerIngrediente];
              }
            }
          }
        });

        setSelectedIngredients(initialSelection);
        setProteinaSeleccionada(proteinaInicial);
        setBaseChorrillanaSeleccionada(baseChorrillanaInicial);
      } catch (err) {
        console.error('Error al cargar ingredientes:', err);
        setError(err.message || 'Error al cargar los ingredientes');
      } finally {
        setLoading(false);
      }
    };

    if (idEvento) {
      fetchIngredientes();
    } else {
      setError('No se proporcionó ID de plato');
      setLoading(false);
    }
  }, [idEvento]);

  const handleSelectIngredient = (grupoId, ingrediente) => {
    if (!ingrediente || !grupoId) return;

    const grupo = ingredientesData.find(g => g.id_tipoingrediente === grupoId);
    if (!grupo) return;

    if (esTipoEspecial && ingrediente.es_principal) {
      setProteinaSeleccionada(ingrediente.id.toString());
      setSelectedIngredients(prev => ({ ...prev, [grupoId]: [ingrediente] }));
      return;
    }

    if (esChorrillana && ingrediente.es_base_chorrillana) {
      setBaseChorrillanaSeleccionada(ingrediente.id.toString());
      setSelectedIngredients(prev => ({ ...prev, [grupoId]: [ingrediente] }));
      return;
    }

    setSelectedIngredients(prev => {
      const currentSelected = [...(prev[grupoId] || [])];
      const index = currentSelected.findIndex(item => item.id === ingrediente.id);

      if (index !== -1) {
        if (grupo.obligatorio && grupo.max_seleccion === 1 && currentSelected.length === 1) {
          return { ...prev, [grupoId]: [ingrediente] };
        } else {
          currentSelected.splice(index, 1);
        }
      } else {
        if (grupo.max_seleccion === 1) {
          return { ...prev, [grupoId]: [ingrediente] };
        } else if (currentSelected.length < (grupo.max_seleccion || 1)) {
          currentSelected.push(ingrediente);
        } else {
          return prev;
        }
      }

      return { ...prev, [grupoId]: currentSelected };
    });
  };

  const isIngredientSelected = (grupoId, ingredienteId) => {
    return selectedIngredients[grupoId]?.some(item => item.id === ingredienteId);
  };

  const validateSelection = () => {
    if (!Array.isArray(ingredientesData)) return false;

    for (const grupo of ingredientesData) {
      if (grupo.obligatorio) {
        const seleccionados = selectedIngredients[grupo.id_tipoingrediente] || [];
        const minRequerido = grupo.max_seleccion || 1; // usamos max_seleccion como mínimo

        if (seleccionados.length < minRequerido) {
          return false;
        }
      }
    }

    return true;
  };

  useEffect(() => {
    let total = precioBase || 0;

    if (typeof selectedIngredients !== 'object' || selectedIngredients === null) {
      setPrecioTotal(total);
      return;
    }

    Object.values(selectedIngredients).forEach((ingredientesGrupo) => {
      if (!Array.isArray(ingredientesGrupo)) return;

      ingredientesGrupo.forEach((ingrediente) => {
        if (!ingrediente) return;

        if (esTipoEspecial) {
          if (ingrediente.es_principal) {
            total += parseInt(ingrediente.precio || 0);
          } else {
            if (
              proteinaSeleccionada &&
              ingrediente.precios &&
              ingrediente.precios[proteinaSeleccionada]
            ) {
              total += parseInt(ingrediente.precios[proteinaSeleccionada]);
            } else if (ingrediente.precio) {
              total += parseInt(ingrediente.precio);
            }
          }
        } else if (esChorrillana) {
          if (ingrediente.es_base_chorrillana) {
            total += parseInt(ingrediente.precio || 0);
          } else {
            if (
              baseChorrillanaSeleccionada &&
              ingrediente.precios &&
              ingrediente.precios[baseChorrillanaSeleccionada]
            ) {
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
  }, [
    selectedIngredients,
    proteinaSeleccionada,
    baseChorrillanaSeleccionada,
    precioBase,
    esTipoEspecial,
    esChorrillana
  ]);

    const renderIngredientes = () => {
    if (loading) {
        return <p className="loader">Cargando ingredientes...</p>;
    }

    if (error) {
        return <p className="errorText">{error}</p>;
    }

    if (!ingredientesData || !Array.isArray(ingredientesData)) {
        return <p className="errorText">Formato de datos incorrecto</p>;
    }

    if (ingredientesData.length === 0) {
        return <p className="noIngredientsText">No hay ingredientes disponibles</p>;
    }

    const ingredientesOrdenados = [
        ...ingredientesData.filter((grupo) => grupo.obligatorio),
        ...ingredientesData.filter((grupo) => !grupo.obligatorio),
    ];

    return (
        <div>
        {ingredientesOrdenados.map((grupo, index) => (
            <div className="ingredienteGrupo" key={`${grupo.id_tipoingrediente}-${index}`}>
            <h4 className="grupoTitulo">
                {grupo.tipo_ingrediente_nombre}
                {grupo.obligatorio ? ' (Obligatorio)' : ''}
            </h4>
            <p className="grupoSubTitulo">
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
                precioMostrar = ingrediente.precios[proteinaSeleccionada] || ingrediente.precio;
                } else if (
                esChorrillana &&
                !ingrediente.es_base_chorrillana &&
                baseChorrillanaSeleccionada &&
                ingrediente.precios
                ) {
                precioMostrar = ingrediente.precios[baseChorrillanaSeleccionada] || ingrediente.precio;
                }

                const isSelected = isIngredientSelected(grupo.id_tipoingrediente, ingrediente.id);

                return (
                <button
                    key={ingrediente.id}
                    onClick={() => handleSelectIngredient(grupo.id_tipoingrediente, ingrediente)}
                    className={`ingredienteItem ${isSelected ? 'ingredienteSelected' : ''}`}
                >
                    <span className="ingredienteNombre">{ingrediente.nombre}</span>
                    {precioMostrar !== null && (
                    <span className="ingredientePrecio">
                        {precioMostrar !== undefined ? `+$${precioMostrar}` : ''}
                    </span>
                    )}
                </button>
                );
            })}

            {grupo.obligatorio && (() => {
              const seleccionados = selectedIngredients[grupo.id_tipoingrediente] || [];
              const minRequerido = grupo.max_seleccion || 1;
              const faltan = minRequerido - seleccionados.length;

              return seleccionados.length < minRequerido ? (
                <p className="errorSelection">
                  Debes seleccionar al menos {minRequerido} ingrediente{minRequerido > 1 ? 's' : ''} (
                  te faltan {faltan})
                </p>
              ) : null;
            })()}
            </div>
        ))}
        </div>
    );
    };

    const handleAdvance = () => {
    if (!validateSelection()) {
        window.alert('Debes completar todas las selecciones obligatorias');
        return;
    }

    if (!id_mesa || !nombre_cliente) {
        window.alert('Faltan datos de mesa o cliente');
        return;
    }

    const ingredientesSeleccionadosParaEnviar = [];
    for (const grupoId in selectedIngredients) {
        if (Array.isArray(selectedIngredients[grupoId])) {
        ingredientesSeleccionadosParaEnviar.push(...selectedIngredients[grupoId]);
        }
    }

    console.log('Ingredientes seleccionados:', idUnico);

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

    const datosActualizados = {
        ...datosAnteriores,
        platos: [...(datosAnteriores.platos || []), nuevaSeleccion]
    };

    // Navegar a la ruta de resumen con los datos
    navigate('/resumenpedido', { state: { datos: datosActualizados } });
    };

    return (
        <div
            className="safeArea"
            style={{
                backgroundImage: `url('/assets/fondo.webp')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
        <div className="container">
            <div className="scrollContainer">

            <div className="nombrePlatoBox">
                <h2 className="nombrePlatoText">{nombreEvento}</h2>
            </div>

            {foto ? (
                <img
                src={`${config.API_BASE_URL}${foto}`}
                alt={nombreEvento}
                className="imagenPlato"
                />
            ) : (
                <p className="textoNoImagen">No hay imagen disponible</p>
            )}

            {descripcion && (
                <p className="itemDescription">{descripcion}</p>
            )}

            <p className="itemPrice">Precio total: ${precioTotal}</p>

            <div className="ingredientesContainer">
                <h3 className="ingredientesTitulo">Personaliza tu plato</h3>
                {renderIngredientes()}
            </div>

            <div className="comentarioContainer">
                <h3 className="ingredientesTitulo">Comentarios adicionales</h3>
              <textarea
                className="textInputComentario"
                placeholder="Escribe tus observaciones aquí..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </div>

            </div>

            <div className="footer-PlatoEspecifico">
            <div className="footerButtons">
                <button
                className="botonAccion"
                style={{ backgroundColor: 'red' }}
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                >
                Cancelar
                </button>

                <button
                className="botonAccion"
                style={{
                    backgroundColor: '#00A99D',
                    opacity: isSubmitting ? 0.6 : 1
                }}
                onClick={handleAdvance}
                disabled={isSubmitting}
                >
                Avanzar
                </button>
            </div>

            <div className="pedidoBox">
                <p className="textoPedido">Pedido de: {nombre_cliente}</p>
                <p className="textoPedido">Mesa: {id_mesa}</p>
            </div>
            </div>
        </div>
        </div>
    );
}