import React, { useState, useEffect } from 'react';
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
import { API_BASE_URL } from '../config';

export default function Mesas({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [comandas, setComandas] = useState([]);
  const [loadingComandas, setLoadingComandas] = useState(false);

  const handleMesaPress = (item) => {
    if (item.estado === 'O') {
      setMesaSeleccionada(item);
      setModalVisible(true);
    } else {
    }
  };

  useEffect(() => {
    const fetchComandas = async () => {
      if (!mesaSeleccionada) return;
      setLoadingComandas(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/comanda/${mesaSeleccionada.id}`);
        const data = await response.json();
        setComandas(data);
      } catch (error) {
        console.error('Error al obtener comandas:', error);
        setComandas([]);
      } finally {
        setLoadingComandas(false);
      }
    };

    if (modalVisible) {
      fetchComandas();
    }
  }, [mesaSeleccionada, modalVisible]);

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

              {loadingComandas ? (
                <ActivityIndicator size="small" color="#0000ff" />
              ) : comandas && comandas.id ? (
                <View style={{ marginTop: 10, width: '100%' }}>
                  <Text style={{ fontWeight: 'bold' }}>Cliente:</Text>
                  <Text>{comandas.nombre_cliente}</Text>

                  <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Fecha:</Text>
                  <Text>{new Date(comandas.fecha).toLocaleString()}</Text>

                  <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Platos:</Text>
                  {comandas.platos.map((plato, index) => (
                    <View key={index} style={{ marginBottom: 10 }}>
                      <Text style={{ fontWeight: '600' }}>{plato.nombre} - ${plato.precio}</Text>
                      {plato.foto && (
                        <ImageBackground
                          source={{ uri: `${API_BASE_URL}${plato.foto}` }}
                          style={{ width: 100, height: 80, marginVertical: 5 }}
                          imageStyle={{ borderRadius: 5 }}
                        />
                      )}
                      {plato.ingredientes.length > 0 && (
                        <View style={{ marginLeft: 10 }}>
                          <Text style={{ fontWeight: 'bold' }}>Ingredientes:</Text>
                          {plato.ingredientes.map((ing, i) => (
                            <Text key={i}>- {ing.nombre}</Text>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}

                  <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Total a pagar:</Text>
                  <Text>${comandas.precio_final}</Text>
                </View>
              ) : (
                <Text style={{ marginTop: 10 }}>No hay comandas.</Text>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: 'green' }]}
                  onPress={() => {
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Agregar Plato</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: 'red' }]}
                  onPress={() => {
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
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
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
