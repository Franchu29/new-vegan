import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import Mesas from './screens/Mesas';
import IngresoNombreCliente from './screens/IngresoNombreCliente';
import MesaComanda from './screens/MesaComanda';
import Platos from './screens/Platos';
import PlatoEspecifico from './screens/PlatoEspecifico';
import ResumenPedido from './screens/ResumenPedido';
import EditarPlato from './screens/EditarPlato';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
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
        <Stack.Screen 
          name="IngresoNombreCliente" 
          component={IngresoNombreCliente} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Platos" 
          component={Platos} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MesaComanda" 
          component={MesaComanda} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PlatoEspecifico" 
          component={PlatoEspecifico} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ResumenPedido" 
          component={ResumenPedido} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EditarPlato" 
          component={EditarPlato} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
