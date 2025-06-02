import { API_BASE_URL } from '../config';
export async function getEventos() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/tipos_platos`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return [];
  }
}
