import { useEffect, useState } from "react";
import { FlatList, Text, View, ActivityIndicator } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const MesaList = () => {
  const [mesas, setMesas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const db = useSQLiteContext();

    const loadMesas = async () => {
      try {
        const results = await db.getAllAsync(`SELECT * FROM mesa`);
        setMesas(results);
      } catch (error) {
        console.error("DATABASE ERROR: ", error);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    loadMesas();
  }, []);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <FlatList
      data={mesas}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View>
          <Text style={{ color: "#fff" }}>Mesa {item.id}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={{ color: "#fff" }}>No hay mesas disponibles</Text>}
    />
  );
};
export default MesaList;