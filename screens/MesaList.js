import { useEffect, useState } from "react";
import { API_BASE_URL } from '../config';

const MesaList = ({ children }) => {
  const [mesas, setMesas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadMesas = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/mesas`);
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
    };

    loadMesas();

    return () => {
      isMounted = false;
    };
  }, []);

  return children({ mesas, isLoading });
};

export default MesaList;
