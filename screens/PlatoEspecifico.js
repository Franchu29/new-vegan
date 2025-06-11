import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, ActivityIndicator, Alert, TextInput  } from 'react-native';
import { API_BASE_URL } from '../config';

export default function PlatoEspecifico({ route, navigation }) {
  const { datos, idEvento, nombreEvento, descripcion, precio: precioBase, foto } = route.params || {};
  const { nombre_cliente, id_mesa } = datos || {};
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
        const response = await fetch(`${API_BASE_URL}/api/reglas_ingredientes/${idEvento}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Error al obtener los ingredientes');
        }
        const responseData = await response.json();

        setEsTipoEspecial(responseData.es_tipo_especial || false);
        setEsChorrillana(responseData.es_chorrillana || false);
        const reglas = Array.isArray(responseData.reglas) ? responseData.reglas : [];
        setIngredientesData(reglas);

        // Inicializar selecciones
        const initialSelection = {};
        let proteinaInicial = null;
        let baseChorrillanaInicial = null;

        reglas.forEach(grupo => {
          if (grupo && grupo.id_tipoingrediente) {
            initialSelection[grupo.id_tipoingrediente] = [];

            // Si es tipo especial, buscar el primer ingrediente principal (proteína)
            if (responseData.es_tipo_especial && grupo.ingredientes?.some(i => i.es_principal)) {
              const primeraProteina = grupo.ingredientes.find(i => i.es_principal);
              if (primeraProteina) {
                initialSelection[grupo.id_tipoingrediente] = [primeraProteina];
                proteinaInicial = primeraProteina.id.toString();
              }
            }
            
            // Si es chorrillana, buscar la primera base (2p o 4p)
            if (responseData.es_chorrillana && grupo.ingredientes?.some(i => i.es_base_chorrillana)) {
              const primeraBase = grupo.ingredientes.find(i => i.es_base_chorrillana);
              if (primeraBase) {
                initialSelection[grupo.id_tipoingrediente] = [primeraBase];
                baseChorrillanaInicial = primeraBase.id.toString();
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

    // Si es tipo especial y es un ingrediente principal
    if (esTipoEspecial && ingrediente.es_principal) {
      setProteinaSeleccionada(ingrediente.id.toString());
      setSelectedIngredients(prev => ({
        ...prev,
        [grupoId]: [ingrediente]
      }));
      return;
    }

    // Si es chorrillana y es la base (2p o 4p)
    if (esChorrillana && ingrediente.es_base_chorrillana) {
      setBaseChorrillanaSeleccionada(ingrediente.id.toString());
      setSelectedIngredients(prev => ({
        ...prev,
        [grupoId]: [ingrediente]
      }));
      return;
    }

    setSelectedIngredients(prev => {
      const currentSelected = [...(prev[grupoId] || [])];
      const index = currentSelected.findIndex(item => item.id === ingrediente.id);

      if (index !== -1) {
        currentSelected.splice(index, 1);
      } else {
        if (grupo.max_seleccion === 1) {
          return { ...prev, [grupoId]: [ingrediente] };
        } else if (currentSelected.length < (grupo.max_seleccion || 1)) {
          currentSelected.push(ingrediente);
        }
      }

      return { ...prev, [grupoId]: currentSelected };
    });
  };

  const isIngredientSelected = (grupoId, ingredienteId) => {
    return selectedIngredients[grupoId]?.some(item => item.id === ingredienteId);
  };

  const validateSelection = () => {
    if (!ingredientesData || !Array.isArray(ingredientesData)) return false;

    for (const grupo of ingredientesData) {
      if (grupo.obligatorio && (!selectedIngredients[grupo.id_tipoingrediente] ||
          selectedIngredients[grupo.id_tipoingrediente].length === 0)) {
        return false;
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

    Object.values(selectedIngredients).forEach(ingredientesGrupo => {
      if (!Array.isArray(ingredientesGrupo)) return;

      ingredientesGrupo.forEach(ingrediente => {
        if (!ingrediente) return;

        if (esTipoEspecial) {
          // Para tipo especial, manejar precios dinámicos
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
          // Para chorrillana, manejar precios dinámicos
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
          // Para otros tipos de plato, sumar el precio normal
          total += parseInt(ingrediente.precio || 0);
        }
      });
    });

    setPrecioTotal(total);
  }, [selectedIngredients, proteinaSeleccionada, baseChorrillanaSeleccionada, precioBase, esTipoEspecial, esChorrillana]);

  const renderIngredientes = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#00ff00" style={styles.loader} />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    if (!ingredientesData || !Array.isArray(ingredientesData)) {
      return <Text style={styles.errorText}>Formato de datos incorrecto</Text>;
    }

    if (ingredientesData.length === 0) {
      return <Text style={styles.noIngredientsText}>No hay ingredientes disponibles</Text>;
    }

    return ingredientesData.map((grupo, index) => (
      <View key={`${grupo.id_tipoingrediente}-${index}`} style={styles.ingredienteGrupo}>
        <Text style={styles.grupoTitulo}>
          {grupo.tipo_ingrediente_nombre}
          {grupo.obligatorio ? ' (Obligatorio)' : ''}
        </Text>
        <Text style={styles.grupoSubTitulo}>
          {`Seleccionados: ${selectedIngredients[grupo.id_tipoingrediente]?.length || 0}/${grupo.max_seleccion || 1}`}
        </Text>

        {grupo.ingredientes?.map((ingrediente) => {
          let precioMostrar = ingrediente.precio;

          // Mostrar precio específico para tipo especial si existe
          if (esTipoEspecial && !ingrediente.es_principal && proteinaSeleccionada && ingrediente.precios) {
            precioMostrar = ingrediente.precios[proteinaSeleccionada] || ingrediente.precio;
          }
          // Mostrar precio específico para chorrillana si existe
          else if (esChorrillana && !ingrediente.es_base_chorrillana && baseChorrillanaSeleccionada && ingrediente.precios) {
            precioMostrar = ingrediente.precios[baseChorrillanaSeleccionada] || ingrediente.precio;
          }

          return (
            <TouchableOpacity
              key={ingrediente.id}
              style={[
                styles.ingredienteItem,
                isIngredientSelected(grupo.id_tipoingrediente, ingrediente.id) && styles.ingredienteSelected
              ]}
              onPress={() => handleSelectIngredient(grupo.id_tipoingrediente, ingrediente)}
            >
              <Text style={styles.ingredienteNombre}>{ingrediente.nombre}</Text>
              {precioMostrar !== null && (
                <Text style={styles.ingredientePrecio}>
                  {precioMostrar !== undefined ? `+$${precioMostrar}` : ''}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        {grupo.obligatorio && (!selectedIngredients[grupo.id_tipoingrediente] ||
          selectedIngredients[grupo.id_tipoingrediente].length === 0) && (
          <Text style={styles.errorSelection}>Debes seleccionar al menos 1 ingrediente</Text>
        )}
      </View>
    ));
  };

  const handleAdvance = () => {
    if (!validateSelection()) {
      Alert.alert('Error', 'Debes completar todas las selecciones obligatorias');
      return;
    }

    if (!id_mesa || !nombre_cliente) {
      Alert.alert('Error', 'Faltan datos de mesa o cliente');
      return;
    }

    const ingredientesSeleccionadosParaEnviar = [];
    for (const grupoId in selectedIngredients) {
      if (Array.isArray(selectedIngredients[grupoId])) {
        ingredientesSeleccionadosParaEnviar.push(...selectedIngredients[grupoId]);
      }
    }

    const nuevaSeleccion = {
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

    navigation.navigate('ResumenPedido', { datos: datosActualizados });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.nombrePlatoBox}>
            <Text style={styles.nombrePlatoText}>{nombreEvento}</Text>
          </View>

          {foto ? (
            <Image
              source={{ uri: `${API_BASE_URL}${foto}` }}
              style={styles.imagenPlato}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.textoNoImagen}>No hay imagen disponible</Text>
          )}

          {descripcion && (
            <Text style={styles.itemDescription}>{descripcion}</Text>
          )}

          <Text style={styles.itemPrice}>Precio total: ${precioTotal}</Text>

          <View style={styles.ingredientesContainer}>
            <Text style={styles.ingredientesTitulo}>Personaliza tu plato</Text>
            {renderIngredientes()}
          </View>

          <View style={styles.comentarioContainer}>
            <Text style={styles.ingredientesTitulo}>Comentarios adicionales</Text>
            <TextInput
              style={styles.textInputComentario}
              multiline
              numberOfLines={4}
              placeholder="Escribe tus observaciones aquí..."
              value={comentario}
              onChangeText={setComentario}
            />
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={[styles.botonAccion, { backgroundColor: 'red' }]}
              onPress={() => navigation.goBack()}
              disabled={isSubmitting}
            >
              <Text style={styles.textoBoton}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botonAccion, { 
                backgroundColor: 'green',
                opacity: isSubmitting ? 0.6 : 1 
              }]}
              onPress={handleAdvance}
              disabled={isSubmitting}
            >
              <Text style={styles.textoBoton}>Avanzar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pedidoBox}>
            <Text style={styles.textoPedido}>Pedido de: {nombre_cliente}</Text>
            <Text style={styles.textoPedido}>Mesa: {id_mesa}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#222',
  },
  container: {
    flex: 1,
    backgroundColor: '#222',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 150,
  },
  nombrePlatoBox: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  nombrePlatoText: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imagenPlato: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 30,
  },
  textoNoImagen: {
    color: 'white',
    fontSize: 16,
    marginBottom: 30,
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#444',
    backgroundColor: '#222',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  botonAccion: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBoton: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pedidoBox: {
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoPedido: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  itemDescription: {
    marginTop: 4,
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },
  itemPrice: {
    marginTop: 4,
    color: '#FFD700',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
  },
  ingredientesContainer: {
    width: '100%',
    marginTop: 10,
  },
  ingredientesTitulo: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  ingredienteGrupo: {
    marginBottom: 25,
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
  },
  grupoTitulo: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  grupoSubTitulo: {
    color: '#ddd',
    marginBottom: 10,
    fontSize: 14,
  },
  ingredienteItem: {
    backgroundColor: '#555',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ingredienteSelected: {
    backgroundColor: '#0a6',
  },
  ingredienteNombre: {
    color: 'white',
    fontSize: 14,
  },
  ingredientePrecio: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  noIngredientsText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  errorSelection: {
    color: 'red',
    fontSize: 13,
    marginTop: 5,
  },
  loader: {
    marginTop: 50,
  },
  comentarioContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  textInputComentario: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
});