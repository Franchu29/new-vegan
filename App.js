import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import Mesas from './screens/Mesas';
import { SQLiteProvider } from "expo-sqlite";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SQLiteProvider databaseName="xd.db"
      onInit={async (db) => {
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS mesa (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero INTEGER NOT NULL,
            estado TEXT NOT NULL
          );
          INSERT OR IGNORE INTO mesa (numero, estado) VALUES
            (1, 'disponible'),
            (2, 'disponible'),
            (3, 'ocupada'),
            (4, 'disponible'),
            (5, 'disponible'),
            (6, 'ocupada'),
            (7, 'disponible'),
            (8, 'ocupada'),
            (9, 'disponible'),
            (10, 'disponible'),
            (11, 'ocupada'),
            (12, 'disponible');
          PRAGMA journal_mode = WAL;
        `);
      }}
      options={{ useNewConnection: false }}
      >
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Mesa" 
            component={Mesas} 
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}
