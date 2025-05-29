
export async function crearComanda(nombre_cliente, id_mesa) {
  try {

    const response = await fetch('http://192.168.0.16:5000/api/crear_comanda', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre_cliente,
        id_mesa,
        precio_final: 0.0,
        estado: "E"
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creando comanda:', error);
    throw error;
  }
}