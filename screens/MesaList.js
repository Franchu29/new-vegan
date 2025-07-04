import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

const MesaList = ({ children }) => {
  const [mesas, setMesas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiBaseUrl, setApiBaseUrl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      let isMounted = true;

      try {
        const storedIp = await AsyncStorage.getItem('API_BASE_URL');
        const ip = storedIp || 'http://192.168.0.15:5000'; // fallback por defecto
        setApiBaseUrl(ip);

        const response = await fetch(`${ip}/api/mesas`);
        const data = await response.json();
        if (isMounted) {
          setMesas(data);
        }
      } catch (error) {
        console.error("API ERROR: ", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }

      return () => {
        isMounted = false;
      };
    };

    fetchData();
  }, []);

  const getComandaByMesaId = async (mesaId) => {
    try {
      const ip = apiBaseUrl || 'http://192.168.0.15:5000';
      const response = await fetch(`${ip}/api/comanda/${mesaId}`);
      if (!response.ok) {
        throw new Error("Error al obtener comanda");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API ERROR (comanda de mesa ${mesaId}):`, error);
      return null;
    }
  };

  return children({ mesas, isLoading, getComandaByMesaId });
};

export default MesaList;
