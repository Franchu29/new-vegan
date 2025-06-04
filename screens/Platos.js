import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { getEventos } from './PlatosApi';
import { API_BASE_URL } from '../config';
const fondo = require('../assets/fondo.webp');

export default function Platos({ navigation, route }) {
  const { datos } = route.params || {};


  const [eventos, setEventos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(0);
  const elementosPorPagina = 6;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventos = async () => {
      const data = await getEventos();
      setEventos(data);
      setLoading(false);
    };

    fetchEventos();
  }, []);

  const totalPaginas = Math.ceil(eventos.length / elementosPorPagina);

  const eventosAMostrar = eventos.slice(
    paginaActual * elementosPorPagina,
    (paginaActual + 1) * elementosPorPagina
  );

  const irPaginaAnterior = () => {
    if (paginaActual > 0) setPaginaActual(paginaActual - 1);
  };

  const irPaginaSiguiente = () => {
    if (paginaActual < totalPaginas - 1) setPaginaActual(paginaActual + 1);
  };

return (
  <ImageBackground source={fondo} style={styles.background}>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Eventos</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="white" />
      ) : (
        <>
          <View style={styles.grid}>
            {eventosAMostrar.map((evento) => (
              <TouchableOpacity
                key={evento.id}
                style={styles.itemContainer}
                onPress={() =>
                  navigation.navigate('PlatoEspecifico', {
                    datos,
                    idEvento: evento.id,
                    nombreEvento: evento.nombre,
                    descripcion: evento.descripcion,
                    precio: evento.precio,
                    foto: evento.foto,
                    idComanda: evento.id_comanda
                  })
                }
              >
                <Image
                  source={{ uri: `${API_BASE_URL}${evento.foto}` }}
                  style={styles.itemImage}
                />
                <Text style={{ marginTop: 5, color: 'white', textAlign: 'center' }}>
                  {evento.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.paginationContainer}>
            <TouchableOpacity
              onPress={irPaginaAnterior}
              disabled={paginaActual === 0}
              style={[styles.pageButton, paginaActual === 0 && styles.disabledButton]}
            >
              <Text style={styles.pageButtonText}>←</Text>
            </TouchableOpacity>

            <Text style={styles.pageInfo}>
              Página {paginaActual + 1} de {totalPaginas}
            </Text>

            <TouchableOpacity
              onPress={irPaginaSiguiente}
              disabled={paginaActual === totalPaginas - 1}
              style={[
                styles.pageButton,
                paginaActual === totalPaginas - 1 && styles.disabledButton,
              ]}
            >
              <Text style={styles.pageButtonText}>→</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>

      <View style={styles.footerTextContainer}>
        <Text style={styles.footerText}>
          Pedido de: {datos.nombre_cliente} para Mesa: {datos.id_mesa}
        </Text>
      </View>
    </ScrollView>
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 10,
    marginTop: 40,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  itemContainer: {
    width: '40%',
    margin: 10,
    alignItems: 'center',
  },
  itemImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginBottom: 20,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerTextContainer: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 8,
  },
  footerText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageButton: {
    padding: 10,
    marginHorizontal: 20,
    backgroundColor: 'green',
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  pageButtonText: {
    color: 'white',
    fontSize: 20,
  },
  pageInfo: {
    color: 'white',
    fontSize: 16,
  },
});
