import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

const fondo = require('../assets/fondo.png');

export default function Mesas({ navigation }) {
  return (
    <ImageBackground source={fondo} style={styles.background}>
      <View style={styles.container}>

        <View style={styles.box}>
          <Text style={styles.text}>Número de Mesa</Text>
        </View>

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
});
