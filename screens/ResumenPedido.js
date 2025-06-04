import React, { useState } from 'react';
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
import { API_BASE_URL } from '../config';

const fondo = require('../assets/fondo.webp');

const ResumenPedido = () => {


  const route = useRoute();
  const navigation = useNavigation();
  const { datos } = route.params || {};
  console.log('Platos: ResumenPedido', datos);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const generarComanda = async () => {
    if (!datos || !datos.platos || datos.platos.length === 0) return;

    setIsSubmitting(true);

    try {
      let comandaId = null;

      const { id_mesa, nombre_cliente, platos } = datos;

      // 1. Crear comanda
      const comandaResponse = await fetch(`${API_BASE_URL}/api/crear_comanda`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_mesa,
          nombre_cliente,
          estado: 'E',
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

      // Redirige a HomeScreen después
      navigation.navigate('Home');

    } catch (error) {
      console.error('Error completo:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackground source={fondo} style={styles.safeArea} resizeMode="cover">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Pedido</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {datos.platos?.map((item, index) => (
            <View key={index} style={styles.card}>
              <Image
                source={{ uri: `${API_BASE_URL}${item.foto}` }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.infoContainer}>
                <Text style={styles.nombrePlatoText}>{item.nombreEvento}</Text>

                <Text style={styles.label}>Cliente:</Text>
                <Text style={styles.value}>{item.nombre_cliente}</Text>

                <Text style={styles.label}>Mesa:</Text>
                <Text style={styles.value}>{item.id_mesa}</Text>

                <Text style={styles.label}>Descripción:</Text>
                <Text style={styles.value}>{item.descripcion}</Text>

                <Text style={styles.label}>Precio:</Text>
                <Text style={styles.value}>${item.precio}</Text>

                <Text style={styles.label}>Ingredientes:</Text>
                {item.ingredientesSeleccionados?.length > 0 ? (
                  item.ingredientesSeleccionados.map((ing, i) => (
                    <View key={i} style={styles.ingredienteItem}>
                      <Text style={styles.ingredienteNombre}>{ing.nombre}</Text>
                      <Text style={styles.ingredientePrecio}>${ing.precio || 0}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noIngredientsText}>
                    No hay ingredientes seleccionados.
                  </Text>
                )}
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.botonMas}
            onPress={() =>
              navigation.navigate('Platos', {datos,})
            }
          >
            <Text style={styles.botonMasTexto}>+</Text>
          </TouchableOpacity>

          {datos.length > 0 && (
            <View style={styles.pedidoResumenContainer}>
              <Text style={styles.pedidoResumen}>
                Pedido de: <Text style={styles.boldText}>{datos[0].nombre_cliente}</Text> para la mesa <Text style={styles.boldText}>{datos[0].id_mesa}</Text>
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
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
    backgroundColor: 'green',
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
    backgroundColor: '#28a745',
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
    backgroundColor: 'green',
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
    color: 'black',
  },
  pedidoResumen: {
    fontSize: 16,
    color: 'black',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'green',
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
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  footerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResumenPedido;
