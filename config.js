// config.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const config = {
  API_BASE_URL: 'http://192.168.0.15:5000',
};

// Carga la IP guardada desde almacenamiento
export const loadApiBaseUrl = async () => {
  try {
    const stored = await AsyncStorage.getItem('API_BASE_URL');
    if (stored) {
      config.API_BASE_URL = stored;
    }
  } catch (err) {
    console.error('Error cargando API_BASE_URL:', err);
  }
};

// Guarda la IP y actualiza en memoria
export const setApiBaseUrl = async (url) => {
  try {
    await AsyncStorage.setItem('API_BASE_URL', url);
    config.API_BASE_URL = url;
  } catch (err) {
    console.error('Error guardando API_BASE_URL:', err);
  }
};

// Otros exports que ya tenías
export const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];
export const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi'];
export const MAX_IMAGES_POST = 10;
