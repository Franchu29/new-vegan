export const config = {
  API_BASE_URL: 'http://192.168.0.15:5000', // Valor por defecto o placeholder
};

export async function loadApiBaseUrl() {
  // Aquí puedes hacer async si luego quieres ampliar (ejemplo lectura de archivo, etc)
  const ipGuardada = localStorage.getItem('API_BASE_URL');
  if (ipGuardada) {
    config.API_BASE_URL = ipGuardada;
  }
}