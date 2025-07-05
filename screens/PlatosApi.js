import { loadApiBaseUrl, config } from '../config.js';

export async function getEventos() {
  try {
    // Carga la IP dinámica antes de hacer la solicitud
    await loadApiBaseUrl();

    const res = await fetch(`${config.API_BASE_URL}/api/tipos_platos`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return [];
  }
}
