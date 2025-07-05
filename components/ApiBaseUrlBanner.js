
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, NativeEventEmitter, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ApiBaseUrlBanner() {
  const [apiBaseUrl, setApiBaseUrl] = useState('');

  useEffect(() => {
    const fetchApiBaseUrl = async () => {
      const value = await AsyncStorage.getItem('API_BASE_URL');
      setApiBaseUrl(value || 'http://192.168.0.15:5000');
    };
    fetchApiBaseUrl();

    // Escuchar evento global para cambios en la IP
    const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample || {});
    const subscription = eventEmitter.addListener('API_BASE_URL_UPDATED', fetchApiBaseUrl);

    return () => {
      subscription.remove();
    };
  }, []);

  if (!apiBaseUrl) return null;

  return (
    <View style={styles.banner} pointerEvents="none">
      <Text style={styles.text}>{apiBaseUrl}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 12,
  },
});
