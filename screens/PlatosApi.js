
export async function getEventos() {
  try {
    const res = await fetch('http://192.168.0.16:5000/api/platos');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return [];
  }
}
