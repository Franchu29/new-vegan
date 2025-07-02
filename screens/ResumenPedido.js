import React, { useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../config.js';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import uuid from 'react-native-uuid';

const fondo = require('../assets/fondo.webp');

const ResumenPedido = () => {

  const route = useRoute();
  const navigation = useNavigation();
  const [datos, setDatos] = useState(route.params?.datos || {});

  // 1. Contar burritos
  const burritoCount = datos.platos?.filter(
    (item) => item.nombreEvento?.toLowerCase().includes('burrito')
  ).length || 0;

  // 2. Calcular descuento
  const descuentoBurritos = Math.floor(burritoCount / 2) * 800;

  // 3. Calcular total con descuento
  const totalSinDescuento = datos.platos?.reduce((sum, item) => sum + item.precio, 0) || 0;
  const total = totalSinDescuento - descuentoBurritos;

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [tipoConsumo, setTipoConsumo] = useState('S');
  const idUnico = route.params?.idUnico || uuid.v4();

const generarComanda = async () => {
  if (!datos || !datos.platos || datos.platos.length === 0) return;

  setIsSubmitting(true);

  try {
    let comandaId = null;
    const { id_mesa, nombre_cliente, platos } = datos;

    if (!id_mesa || !nombre_cliente || !platos || platos.length === 0) {
      Alert.alert('Error', 'Faltan datos para generar la comanda');
      return;
    }

    // ✅ 0. Verificar estado de la mesa antes de crear la comanda
    try {
      console.log('Obteniendo estado de la mesa:', id_mesa);
      const response = await fetch(`${API_BASE_URL}/api/mesa/${id_mesa}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'No se pudo obtener el estado de la mesa');
      }

      const estado_mesa = await response.json();
      console.log('Estado de la mesa:', estado_mesa);

      if (estado_mesa.estado === 'L') {
        // 1. Crear comanda

        const comandaResponse = await fetch(`${API_BASE_URL}/api/crear_comanda`, {
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
          const platoResponse = await fetch(`${API_BASE_URL}/api/comanda/${comandaId}/agregar_plato`, {
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

          // 3. Agregar ingredientes (si hay)
          const ingredientes = (item.ingredientesSeleccionados || []).map(ing => ({
            id_ingrediente: ing.id,
            precio: ing.precio || null,
          }));

          if (ingredientes.length > 0) {
            const ingredientesResponse = await fetch(
              `${API_BASE_URL}/api/comanda/plato/${idPlatoxComanda}/agregar_ingredientes`,
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

        navigation.navigate('Home');

      } else if (estado_mesa.estado === 'O') {
        // ❌ Si la mesa está ocupada, obtener comanda actual y mostrar ID

        const comandaExistenteResponse = await fetch(`${API_BASE_URL}/api/comanda/${id_mesa}`);
        if (!comandaExistenteResponse.ok) {
          const errorData = await comandaExistenteResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'No se pudo obtener la comanda actual');
        }

        const comandaExistente = await comandaExistenteResponse.json();
        console.log('Comanda existente:', comandaExistente);
        console.log('ID de la comanda actual:', comandaExistente.id);

        const comandaId = comandaExistente.id;

        // 1. Agregar cada plato
        for (const item of platos) {
          const platoResponse = await fetch(`${API_BASE_URL}/api/comanda/${comandaId}/agregar_plato`, {
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

          // 2. Agregar ingredientes (si hay)
          const ingredientes = (item.ingredientesSeleccionados || []).map(ing => ({
            id_ingrediente: ing.id,
            precio: ing.precio || null,
          }));

          if (ingredientes.length > 0) {
            const ingredientesResponse = await fetch(
              `${API_BASE_URL}/api/comanda/plato/${idPlatoxComanda}/agregar_ingredientes`,
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
        navigation.navigate('Home');
      }

    } catch (estadoError) {
      console.error('Error al verificar estado de mesa o procesar comanda:', estadoError.message);
      Alert.alert('Error', estadoError.message);
      return;
    }

  } catch (error) {
    console.error('Error completo:', error);
    Alert.alert('Error', error.message);
  } finally {
    setIsSubmitting(false);
  }
};

  const eliminarPlato = (index) => {
    const nuevosPlatos = [...(datos.platos || [])];
    nuevosPlatos.splice(index, 1);
    setDatos({ ...datos, platos: nuevosPlatos });
  };

  return (
    <ImageBackground source={fondo} style={styles.safeArea} resizeMode="cover">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Pedido de: <Text style={styles.boldText}>{datos.nombre_cliente}</Text> para la mesa <Text style={styles.boldText}>{datos.id_mesa}</Text>
          </Text>
        </View>

        {/* Mueve este bloque aquí, antes del ScrollView */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}>
          <TouchableOpacity
            style={[
              styles.tipoConsumoButton,
              tipoConsumo === 'S' && styles.tipoConsumoButtonSelected,
            ]}
            onPress={() => setTipoConsumo('S')}
          >
            <Text style={styles.tipoConsumoText}>Para servir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tipoConsumoButton,
              tipoConsumo === 'L' && styles.tipoConsumoButtonSelected,
            ]}
            onPress={() => setTipoConsumo('L')}
          >
            <Text style={styles.tipoConsumoText}>Para llevar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Mostrar solo una vez los datos del cliente y mesa */}

                {datos.platos?.map((item, index) => (
                <View key={index} style={styles.card}>
                  <Image
                  source={{ uri: `${API_BASE_URL}${item.foto}` }}
                  style={styles.itemImage}
                  resizeMode="cover"
                  />
                  <View style={styles.infoContainer}>
                  <Text style={styles.nombrePlatoText}>{item.nombreEvento}</Text>

                  <Text style={styles.label}>Descripción:</Text>
                  {item.descripcion && item.descripcion.trim().length > 0 ? (
                    <Text style={styles.value}>{item.descripcion}</Text>
                  ) : (
                    <Text style={styles.value}>
                    Sin descripción
                    </Text>
                  )}

                  <Text style={styles.label}>Precio:</Text>
                  <Text style={styles.value}>${item.precio}</Text>

                  <Text style={styles.label}>Ingredientes:</Text>
                  {item.ingredientesSeleccionados?.length > 0 ? (
                    item.ingredientesSeleccionados.map((ing, i) => (
                    <View key={i} style={styles.ingredienteItem}>
                      <Text style={styles.ingredienteNombre}>{ing.nombre}</Text>
                    </View>
                    ))
                  ) : (
                    <Text style={styles.noIngredientsText}>
                    No hay ingredientes seleccionados.
                    </Text>
                  )}
                  {item.comentario && item.comentario.trim().length > 0 && (
                    <>
                      <Text style={styles.label}>Comentario:</Text>
                      <Text style={styles.value}>{item.comentario}</Text>
                    </>
                  )}

                  <View style={styles.buttonContainer}>
                    {/* Botón editar */}
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => 
                        navigation.navigate('EditarPlato', { plato: item, mesa: datos.id_mesa, cliente: datos.nombre_cliente, datos:datos })}
                    >
                      <Icon name="pencil" size={24} color="#fff" />
                    </TouchableOpacity>

                    {/* Botón eliminar */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => eliminarPlato(index)}
                    >
                      <Icon name="trash-can" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.botonMas}
            onPress={() =>
              navigation.navigate('Platos', { datos })
            }
          >
            <Text style={styles.botonMasTexto}>+</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          {descuentoBurritos > 0 && (
            <View style={styles.totalContainer}>
              <Text style={[styles.totalLabel, { color: '#FFD700' }]}>Descuento Burritos:</Text>
              <Text style={[styles.totalAmount, { color: '#FFD700' }]}>- ${descuentoBurritos}</Text>
            </View>
          )}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>${total.toFixed(0)}</Text>
          </View>
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.footerButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={generarComanda}
              disabled={isSubmitting}
            >
              <Text style={styles.footerButtonText}>
                {isSubmitting ? 'Procesando...' : 'Generar Comanda'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#222',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(34,34,34,0.85)',
    paddingTop: 40,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 150,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    alignItems: 'flex-start',
  },
  itemImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  nombrePlatoText: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    color: '#AAA',
    fontSize: 14,
    fontWeight: 'bold',
  },
  value: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  ingredienteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#555',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
  },
  ingredienteNombre: {
    color: 'white',
    fontSize: 14,
  },
  ingredientePrecio: {
    color: '#FFD700',
    fontWeight: '600',
  },
  noIngredientsText: {
    color: 'white',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 4,
  },
  header: {
    backgroundColor: '#00A99D',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  botonMas: {
    backgroundColor: '#00A99D',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  botonMasTexto: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  pedidoResumenContainer: {
    backgroundColor: '#00A99D',
    padding: 12,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
  pedidoResumen: {
    fontSize: 16,
    color: 'black',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#222',
    borderColor: 'white',
    borderTopWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: '#00A99D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  footerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  itemButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  editButton: {
    backgroundColor: '#00A99D',
    padding: 10,
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
totalContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
  paddingHorizontal: 10,
},
totalLabel: {
  fontSize: 18,
  fontWeight: 'bold',
  color: 'white',
},
totalAmount: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#FFD700',
},
tipoConsumoButton: {
  backgroundColor: '#444',
  paddingVertical: 10,
  paddingHorizontal: 25,
  borderRadius: 8,
  marginHorizontal: 8,
},
tipoConsumoButtonSelected: {
  backgroundColor: '#00A99D',
},
tipoConsumoText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},

});

export default ResumenPedido;
