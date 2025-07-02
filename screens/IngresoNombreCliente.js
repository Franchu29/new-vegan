import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, TextInput, Alert } from 'react-native';

const fondo = require('../assets/fondo.webp');

export default function HomeScreen({ navigation, route }) {
  const { id_mesa } = route.params || {};
  const [nombre_cliente, setNombreCliente] = useState('');

  const handleAceptar = () => {
    if (!nombre_cliente.trim()) {
      Alert.alert('Error', 'Por favor ingrese el nombre del cliente.');
      return;
    }

  const datos = {
    nombre_cliente,
    id_mesa,
    platos: []
  };

  navigation.navigate('Platos', { datos });
  };

  return (
    <ImageBackground source={fondo} style={styles.background}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {id_mesa ? `Comanda para Mesa ${id_mesa}` : 'Comanda'}
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Ingrese nombre Cliente"
          placeholderTextColor="#000"
          value={nombre_cliente}
          onChangeText={setNombreCliente}
          editable={true}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAceptar}
          >
            <Text style={styles.acceptButtonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>

        <StatusBar style="auto" />
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
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
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
  input: {
    backgroundColor: '#00A99D',
    color: 'black',
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    textAlign: 'center',
    marginVertical: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: '#00A99D',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
