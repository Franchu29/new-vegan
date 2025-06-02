import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { API_BASE_URL } from '../config';

export default function PlatoEspecifico({ route, navigation }) {
  const { idEvento, nombreEvento, nombre_cliente, id_mesa, foto, idComanda, precio, descripcion } = route.params || {};
  const [ingredientesData, setIngredientesData] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIngredientes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reglas_ingredientes/${idEvento}`);
        if (!response.ok) {
          throw new Error('Error al obtener los ingredientes');
        }
        const data = await response.json();
        setIngredientesData(data);
        
        // Inicializar el estado de selección
        const initialSelection = {};
        data.forEach(grupo => {
          initialSelection[grupo.id_tipoingrediente] = [];
        });
        setSelectedIngredients(initialSelection);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredientes();
  }, [idEvento]);

  const handleSelectIngredient = (grupoId, ingrediente) => {
    setSelectedIngredients(prev => {
      const currentSelected = [...prev[grupoId]];
      const index = currentSelected.findIndex(item => item.id === ingrediente.id);
      
      // Verificar si ya está seleccionado
      if (index !== -1) {
        // Deseleccionar
        currentSelected.splice(index, 1);
      } else {
        // Verificar límite máximo de selección
        const grupo = ingredientesData.find(g => g.id_tipoingrediente === grupoId);
        if (currentSelected.length >= grupo.max_seleccion) {
          return prev; // No hacer cambios si se alcanzó el máximo
        }
        // Seleccionar
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
      // Verificar si es obligatorio y no tiene selección
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

  const handleAdvance = () => {
    if (!validateSelection()) {
      alert('Debes completar todas las selecciones obligatorias');
      return;
    }
    
    navigation.navigate('AgregarPlato', { 
      idComanda,
      selectedIngredients,
      // Otros parámetros que necesites pasar
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Nombre del plato */}
          <View style={styles.nombrePlatoBox}>
            <Text style={styles.nombrePlatoText}>{nombreEvento}</Text>
          </View>

          {/* Imagen del plato */}
          {foto ? (
            <Image
              source={{ uri: `${API_BASE_URL}${foto}` }}
              style={styles.imagenPlato}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.textoNoImagen}>No hay imagen disponible</Text>
          )}
          
          {/* Descripción del plato */}
          {descripcion && (
            <Text style={styles.itemDescription}>{descripcion}</Text>
          )}

          {/* Precio del plato */}
          {precio && (
            <Text style={styles.itemPrice}>Precio: ${precio}</Text>
          )}
          
          {/* Sección de ingredientes */}
          <View style={styles.ingredientesContainer}>
            <Text style={styles.ingredientesTitulo}>Personaliza tu plato</Text>
            {renderIngredientes()}
          </View>
        </ScrollView>

        {/* Pie fijo con botones y texto */}
        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={[styles.botonAccion, { backgroundColor: 'red' }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.textoBoton}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botonAccion, { backgroundColor: 'green' }]}
              onPress={handleAdvance}
            >
              <Text style={styles.textoBoton}>Avanzar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pedidoBox}>
            <Text style={styles.textoPedido}>Pedido de: {nombre_cliente}</Text>
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
    paddingBottom: 150, // Más espacio para el footer
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
  itemTitle: {
    marginTop: 5,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
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
    marginBottom: 5,
  },
  grupoSubTitulo: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  ingredienteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#444',
    borderRadius: 6,
    marginVertical: 3,
    backgroundColor: '#3a3a3a',
  },
  ingredienteSelected: {
    backgroundColor: '#4a6b3a',
    borderColor: '#6b8a5a',
  },
  ingredienteNombre: {
    color: 'white',
    fontSize: 15,
  },
  ingredientePrecio: {
    color: '#FFD700',
    fontSize: 15,
  },
  loader: {
    marginVertical: 20,
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
  errorSelection: {
    color: '#ff6666',
    fontSize: 13,
    marginTop: 5,
    fontStyle: 'italic',
  },
});