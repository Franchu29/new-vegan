// screens/ConfigScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { config, setApiBaseUrl } from '../config';

export default function ConfigScreen({ navigation }) {
  const [ip, setIp] = useState('');

  useEffect(() => {
    setIp(config.API_BASE_URL); // Cargar IP actual al inicio
  }, []);

  const guardarIP = async () => {
    if (!ip.startsWith('http')) {
      Alert.alert('Error', 'La IP debe comenzar con http:// o https://');
      return;
    }

    await setApiBaseUrl(ip);
    Alert.alert('Guardado', `Nueva IP: ${ip}`);
    navigation.goBack(); // Regresar si estás usando React Navigation
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Dirección IP del backend:</Text>
      <TextInput
        value={ip}
        onChangeText={setIp}
        style={styles.input}
        placeholder="http://192.168.0.15:5000"
        autoCapitalize="none"
        keyboardType="url"
      />
      <TouchableOpacity style={styles.boton} onPress={guardarIP}>
        <Text style={styles.botonTexto}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  label: { fontSize: 18, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  boton: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
