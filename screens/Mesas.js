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

  const handleMesaPress = (item) => {
    if (item.estado === 'O') {
      setMesaSeleccionada(item);
      setModalVisible(true);
    } else {
      console.log(`Mesa ${item.id} está libre`);
    }
  };

  const renderMesa = ({ item }) => {
    const isDisponible = item.estado === "L";

    return (
      <TouchableOpacity
        style={[
          styles.mesaButton,
          { backgroundColor: isDisponible ? "#ccc" : "#555" },
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
                  <Text style={{ color: "#fff", textAlign: "center", marginTop: 20 }}>
                    No hay mesas disponibles
                  </Text>
                }
              />
            )
          }
        </MesaList>

        {/* Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalText}>Mesa {mesaSeleccionada?.id} está ocupada</Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: 'green' }]}
                  onPress={() => {
                    console.log("Botón 1 presionado");
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Agregar Plato</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: 'red' }]}
                  onPress={() => {
                    console.log("Botón 2 presionado");
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Finalizar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
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
    justifyContent: "center",
  },
  mesaButton: {
    flex: 1,
    margin: 5,
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  mesaText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 30,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 10,
  width: '80%',
  alignItems: 'center',
},
modalText: {
  fontSize: 18,
  marginBottom: 20,
  textAlign: 'center',
},
modalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
},
modalButton: {
  flex: 1,
  padding: 10,
  marginHorizontal: 5,
  borderRadius: 8,
  alignItems: 'center',
},
modalButtonText: {
  color: '#fff',
  fontWeight: 'bold',
},
closeButton: {
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 1,
  padding: 5,
},
closeButtonText: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#333',
},
});
