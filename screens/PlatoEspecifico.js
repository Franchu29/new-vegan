import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { API_BASE_URL } from '../config';

export default function PlatoEspecifico({ route, navigation }) {
  const { idEvento, nombreEvento, nombre_cliente, id_mesa, foto, idComanda, precio, descripcion } = route.params || {};

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
              onPress={() => navigation.navigate('AgregarPlato', { idComanda })}
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
},
  itemPrice: {
    marginTop: 4,
    color: '#FFD700',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
},
});
