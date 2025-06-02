import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, ActivityIndicator, Alert, Button, Modal } from 'react-native';
import { API_BASE_URL } from '../config';

export default function PlatoEspecifico({ route, navigation }) {
  const { idEvento, nombreEvento, nombre_cliente, id_mesa, foto, idComanda, precio, descripcion } = route.params || {};
  const [ingredientesData, setIngredientesData] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    console.log('Datos recibidos:', {
      idEvento,
      nombre_cliente,
      id_mesa,
      idComanda
    });

    const fetchIngredientes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reglas_ingredientes/${idEvento}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Error al obtener los ingredientes');
        }
        const data = await response.json();
        setIngredientesData(data);
        
        const initialSelection = {};
        data.forEach(grupo => {
          initialSelection[grupo.id_tipoingrediente] = [];
        });
        setSelectedIngredients(initialSelection);
      } catch (err) {
        console.error('Error al cargar ingredientes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (idEvento) {
      fetchIngredientes();
    } else {
      setError('No se proporcionó ID de plato');
      }
  }, [idEvento]);

  const handleSelectIngredient = (grupoId, ingrediente) => {
    setSelectedIngredients(prev => {
      const currentSelected = [...prev[grupoId]];
      const index = currentSelected.findIndex(item => item.id === ingrediente.id);
      
      if (index !== -1) {
        currentSelected.splice(index, 1);
      } else {
        const grupo = ingredientesData.find(g => g.id_tipoingrediente === grupoId);
        if (currentSelected.length >= grupo.max_seleccion) {
          return prev;
        }
        currentSelected.push(ingrediente);
      }
      
      return {
        ...prev,
        [grupoId]: currentSelected
      };
    });
  };

  const isIngredientSelected = (grupoId, ingredienteId) => {
    return selectedIngredients[grupoId]?.some(item => item.id === ingredienteId);
  };

  const validateSelection = () => {
    for (const grupo of ingredientesData) {
      if (grupo.obligatorio && selectedIngredients[grupo.id_tipoingrediente].length === 0) {
        return false;
      }
    }
    return true;
  };

  const renderIngredientes = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#00ff00" style={styles.loader} />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    if (ingredientesData.length === 0) {
      return <Text style={styles.noIngredientsText}>No hay ingredientes disponibles</Text>;
    }

    return ingredientesData.map((grupo, index) => (
      <View key={index} style={styles.ingredienteGrupo}>
        <Text style={styles.grupoTitulo}>
          {grupo.tipo_ingrediente_nombre} 
          {grupo.obligatorio ? ' (Obligatorio)' : ''}
        </Text>
        <Text style={styles.grupoSubTitulo}>
          {`Seleccionados: ${selectedIngredients[grupo.id_tipoingrediente]?.length || 0}/${grupo.max_seleccion}`}
        </Text>
        
        {grupo.ingredientes.map((ingrediente) => (
          <TouchableOpacity 
            key={ingrediente.id} 
            style={[
              styles.ingredienteItem,
              isIngredientSelected(grupo.id_tipoingrediente, ingrediente.id) && styles.ingredienteSelected
            ]}
            onPress={() => handleSelectIngredient(grupo.id_tipoingrediente, ingrediente)}
          >
            <Text style={styles.ingredienteNombre}>{ingrediente.nombre}</Text>
            {ingrediente.precio && (
              <Text style={styles.ingredientePrecio}>+${ingrediente.precio}</Text>
            )}
          </TouchableOpacity>
        ))}
        
        {grupo.obligatorio && selectedIngredients[grupo.id_tipoingrediente].length === 0 && (
          <Text style={styles.errorSelection}>Debes seleccionar al menos 1 ingrediente</Text>
        )}
      </View>
    ));
  };

  const handleAdvance = async () => {
    if (!validateSelection()) {
      Alert.alert('Error', 'Debes completar todas las selecciones obligatorias');
      return;
    }

    if (!id_mesa || !nombre_cliente) {
      Alert.alert('Error', 'Faltan datos de mesa o cliente');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Crear comanda si no existe
      let comandaId = idComanda;
      
      if (!comandaId) {
        const comandaResponse = await fetch(`${API_BASE_URL}/api/crear_comanda`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_mesa: id_mesa,
            nombre_cliente: nombre_cliente,
            estado: 'E' // Estado 'En curso'
          })
        });

        if (!comandaResponse.ok) {
          const errorData = await comandaResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Error al crear comanda');
        }

        const comandaData = await comandaResponse.json();
        comandaId = comandaData.id_comanda;
        console.log('Comanda creada con ID:', comandaId);
      }

      // 2. Agregar plato a la comanda
      const platoResponse = await fetch(`${API_BASE_URL}/api/comanda/${comandaId}/agregar_plato`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_plato: idEvento
        })
      });

      if (!platoResponse.ok) {
        const errorData = await platoResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al agregar plato');
      }

      const platoData = await platoResponse.json();
      const idPlatoxComanda = platoData.idplatoxcomanda;
      console.log('Plato agregado con ID:', idPlatoxComanda);

      // 3. Agregar ingredientes seleccionados
      const allIngredients = [];
      for (const grupoId in selectedIngredients) {
        allIngredients.push(...selectedIngredients[grupoId].map(ing => ({
          id_ingrediente: ing.id,
          precio: ing.precio || null
        })));
      }

      if (allIngredients.length > 0) {
        const ingredientesResponse = await fetch(
          `${API_BASE_URL}/api/comanda/plato/${idPlatoxComanda}/agregar_ingredientes`, 
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ingredientes: allIngredients
            })
          }
        );

        if (!ingredientesResponse.ok) {
          const errorData = await ingredientesResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Error al agregar ingredientes');
        }

        console.log('Ingredientes agregados:', allIngredients.length);
      }

      // Navegar a pantalla de confirmación
      setShowSuccess(true);

    } catch (error) {
      console.error('Error completo:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
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

          {precio && (
            <Text style={styles.itemPrice}>Precio: ${precio}</Text>
          )}
          
          <View style={styles.ingredientesContainer}>
            <Text style={styles.ingredientesTitulo}>Personaliza tu plato</Text>
            {renderIngredientes()}
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
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.textoBoton}>Avanzar</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.pedidoBox}>
            <Text style={styles.textoPedido}>Pedido de: {nombre_cliente}</Text>
            <Text style={styles.textoPedido}>Mesa: {id_mesa}</Text>
            {idComanda && <Text style={styles.textoPedido}>Comanda: {idComanda}</Text>}
          </View>
        </View>

        <Modal
          visible={showSuccess}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSuccess(false)}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}>
            <View style={{
              backgroundColor: 'white',
              padding: 24,
              borderRadius: 8,
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 18, marginBottom: 12 }}>
                ¡Comanda creada exitosamente para la mesa {id_mesa}!
              </Text>
              <Button
                title="Ir a comanda"
                onPress={() => {
                  setShowSuccess(false);
                  navigation.navigate('VerComanda', { idComanda, mesa: id_mesa });
                }}
              />
            </View>
          </View>
        </Modal>
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
    backgroundColor: '#7cb342',
  },
  ingredienteNombre: {
    color: 'white',
    fontSize: 14,
  },
  ingredientePrecio: {
    color: '#FFD700',
    fontWeight: '600',
    fontSize: 14,
  },
  errorSelection: {
    color: 'red',
    marginTop: 5,
    fontSize: 12,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
  noIngredientsText: {
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
  },
});