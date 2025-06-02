import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';

const fondo = require('../assets/fondo.webp');
import MesaList from './MesaList';

export default function Mesas({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [mesaLibreSeleccionada, setMesaLibreSeleccionada] = useState(null);

  const handleMesaPress = (item) => {
    if (item.estado === 'O') {
      setMesaSeleccionada(item);
      setModalVisible(false);
    } else if (item.estado === 'L') {
      setMesaLibreSeleccionada(item);
      setMesaSeleccionada(null); // Limpiar mesa ocupada si hay
    }
  };

  const renderMesa = ({ item }) => {
    const isDisponible = item.estado === 'L';
    return (
      <TouchableOpacity
        style={[
          styles.mesaButton,
          { backgroundColor: isDisponible ? '#ccc' : '#555' },
        ]}
        onPress={() => handleMesaPress(item)}
      >
        <Text style={styles.mesaText}>Mesa {item.id}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground source={fondo} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.box}>
          <Text style={styles.text}>Número de Mesas</Text>
        </View>

        {/* Mostrar mensajes */}
        {mesaLibreSeleccionada && (
          <View style={{ padding: 10, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 18 }}>
              Mesa libre seleccionada: {mesaLibreSeleccionada.id}
            </Text>
          </View>
        )}

        {mesaSeleccionada && (
          <View style={{ padding: 10, alignItems: 'center' }}>
            <Text style={{ color: '#ffdddd', fontSize: 18 }}>
              Mesa {mesaSeleccionada.id} está ocupada
            </Text>
          </View>
        )}

        <MesaList>
          {({ mesas, isLoading }) =>
            isLoading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <FlatList
                key={'flatlist-4columns'}
                data={mesas}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMesa}
                contentContainerStyle={styles.grid}
                numColumns={4}
                ListEmptyComponent={
                  <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
                    No hay mesas disponibles
                  </Text>
                }
              />
            )
          }
        </MesaList>

        <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
        >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={[
            styles.advanceButton,
            { opacity: mesaLibreSeleccionada ? 1 : 0.5 },
            ]}
            disabled={!mesaLibreSeleccionada}
            onPress={() => {
            if (mesaLibreSeleccionada) {
                navigation.navigate('IngresoNombreCliente', {
                id_mesa: mesaLibreSeleccionada.id,
                });
            }
            }}
        >
            <Text style={styles.advanceButtonText}>Avanzar</Text>
        </TouchableOpacity>
        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    justifyContent: 'space-between',
  },
  box: {
    backgroundColor: 'green',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignSelf: 'center',
  },
  text: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  grid: {
    padding: 10,
    justifyContent: 'center',
  },
  mesaButton: {
    flex: 1,
    margin: 5,
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  mesaText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  advanceButton: {
    backgroundColor: 'green',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  advanceButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
});
