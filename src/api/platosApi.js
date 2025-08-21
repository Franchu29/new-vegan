// src/api/PlatosApi.js
import { config } from '../config/config';

export async function getEventos() {
  const response = await fetch(`${config.API_BASE_URL}/api/tipos_platos`);
  if (!response.ok) {
    throw new Error('Error al obtener eventos');
  }
  return response.json();
}
