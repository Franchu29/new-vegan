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
  ScrollView
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

  const eliminarPlato = async (id_platoxcomanda, ingredientes) => {
    try {
      console.log("Ingredientes a eliminar:", ingredientes);
      // 1. Eliminar cada ingrediente relacionado
      for (const ing of ingredientes) {
        const responseIng = await fetch(`${API_BASE_URL}/api/comanda/plato/eliminar_ingrediente`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id_platoxcomandaxingrediente: ing.id_platoxcomandaxingrediente }),
        });

        if (!responseIng.ok) {
          console.error('Error al eliminar ingrediente', await responseIng.json());
          return; // Detiene si hay un error
        }
      }

      // 2. Ahora eliminar el plato
      const responsePlato = await fetch(`${API_BASE_URL}/api/comanda/eliminar_plato`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idplatoxcomanda: id_platoxcomanda }),
      });

      if (responsePlato.ok) {
        // Actualiza la lista local
        const updatedComandas = {
          ...comandas,
          platos: comandas.platos.filter((p) => p.id_platoxcomanda !== id_platoxcomanda),
        };
        setComandas(updatedComandas);
      } else {
        const err = await responsePlato.json();
        console.error('Error al eliminar el plato:', err);
      }

    } catch (error) {
      console.error('Error general en eliminarPlato:', error);
    }
  };

  const finalizarComanda = async () => {
    if (!comandas.id) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/comanda/${comandas.id}/finalizar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Comanda finalizada correctamente');
        setModalVisible(false);
        setMesaSeleccionada(null);
        navigation.navigate('Home');
      } else {
        alert('Error al finalizar la comanda');
      }
    } catch (error) {
      console.error('Error en PUT:', error);
      alert('Error de red al finalizar la comanda');
    }
  };

  const datos = {
    nombre_cliente: comandas.nombre_cliente,
    id_mesa: mesaSeleccionada?.id,
    platos: []
  };

  // Calcula el descuento de burritos antes del return
  const burritoCount = comandas.platos?.filter(
    (plato) => plato.nombre?.toLowerCase().includes('burrito')
  ).length || 0;
  const descuentoBurritos = Math.floor(burritoCount / 2) * 800;

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
              <ScrollView contentContainerStyle={styles.modalScrollContent}>

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
                  <View style={styles.modalSection}>
                    <Text style={{ fontWeight: 'bold' }}>Cliente:</Text>
                    <Text style={styles.modalSubText}>{comandas.nombre_cliente}</Text>


                    <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Fecha:</Text>
                    <Text>{new Date(comandas.fecha).toLocaleString()}</Text>

                    <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Tipo de Consumo:</Text>
                    <Text>{comandas.tipo_consumo === 'L' ? 'Para Llevar' : 'Para Servir'}</Text>

                    <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Platos:</Text>
                    {comandas.platos.map((plato, index) => (
                      <View key={index} style={{ marginBottom: 10 }}>
                        <Text style={{ fontWeight: '600' }}>{plato.nombre} - ${plato.precio}</Text>
                            { /* 
                            <Text style={{ fontSize: 12, color: 'gray' }}>
                              id_platoxcomanda: {plato.id_platoxcomanda}
                            </Text>
                            */ }

                        {plato.foto && (
                          <ImageBackground
                            source={{ uri: `${API_BASE_URL}${plato.foto}` }}
                            style={{ width: 100, height: 80, marginVertical: 5 }}
                            imageStyle={{ borderRadius: 5 }}
                          />
                        )}
                        {plato.ingredientes.length > 0 && (
                          <View style={{ marginLeft: 0 }}>
                            <Text style={{ fontWeight: 'bold' }}>Ingredientes:</Text>
                            {plato.ingredientes.map((ing, i) => (
                              <Text key={i}>- {ing.nombre}</Text>
                            ))}
                          </View>
                        )}

                        {plato.comentario && plato.comentario.trim().length > 0 && (
                          <>
                            <Text style={{ fontWeight: 'bold', marginTop: 5,}}>
                              Comentario:
                            </Text>
                            <Text style={{}}>{plato.comentario}</Text>
                          </>
                        )}
                        
                        <TouchableOpacity
                          onPress={() => eliminarPlato(plato.id_platoxcomanda, plato.ingredientes)}
                          style={{
                            backgroundColor: '#ff4d4d',
                            padding: 6,
                            borderRadius: 5,
                            marginTop: 5,
                            alignSelf: 'flex-start',
                            flexDirection: 'row',
                          }}
                        >
                          <Text style={{ color: 'white', marginRight: 5 }}>Eliminar</Text>
                          <Text style={{ color: 'white', fontSize: 16 }}>🗑️</Text>
                        </TouchableOpacity>
                        <View style={{ height: 2, backgroundColor: '#ccc', marginVertical: 10 }} />
                      </View>
                    ))}

                    {/* Nuevo código para el descuento de burritos */}
                    {/*
                    Calcula el descuento de burritos
                    */}
                    
                    {descuentoBurritos > 0 && (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                        <Text style={{ fontWeight: 'bold', color: '#000000' }}>Descuento Burritos:</Text>
                        <Text style={{ color: '#000000' }}>- ${descuentoBurritos}</Text>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                        <Text style={{ fontWeight: 'bold', color: '#000000' }}>Total a pagar:</Text>
                        <Text style={{ color: '#000000' }}>${comandas.precio_final}</Text>
                      </View>
                  </View>
                ) : (
                  <Text style={{ marginTop: 10 }}>No hay comandas.</Text>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#00A99D' }]}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate('Platos', { datos });
                    }}
                  >
                    <Text style={styles.modalButtonText}>Agregar Plato</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: 'red' }]}
                    onPress={finalizarComanda}
                  >
                    <Text style={styles.modalButtonText}>Finalizar</Text>
                  </TouchableOpacity>
                </View>

                {/* Botón Imprimir Comanda */}
                {comandas && comandas.id && (
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#007AFF', marginTop: 10, width: '100%' }]}
                    onPress={async () => {
                      try {
                        const response = await fetch(`${API_BASE_URL}/api/imprimir_comanda/${comandas.id}`);
                        if (response.ok) {
                          alert('Comanda enviada a impresión');
                        } else {
                          alert('No se pudo imprimir la comanda');
                        }
                      } catch (error) {
                        alert('Error de red al imprimir la comanda');
                      }
                    }}
                  >
                    <Text style={styles.modalButtonText}>Imprimir comanda</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
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
    backgroundColor: '#00A99D',
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
    width: '90%',
    justifyContent: 'center'
  },
  modalSection: {
    width: '100%',
    marginTop: 10,
  },
  modalSubText: {
    fontSize: 16,
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
  modalScrollContent: {
    paddingBottom: 30,
    alignItems: 'flex-start',
    width: '100%',
  },

});
