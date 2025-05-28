import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity} from 'react-native';

const fondo = require('../assets/fondo.png');

export default function HomeScreen({ navigation }) {
  return (
    <ImageBackground source={fondo} style={styles.background}>
      <View style={styles.overlay}>

        <TouchableOpacity style={styles.boton}>
          <Text style={styles.textoBoton}>INICIAR COMANDA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => navigation.navigate('Mesa')}
        >
          <Text style={styles.textoBoton}>COMANDAS ACTIVAS</Text>
        </TouchableOpacity>

        <StatusBar style="auto" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  texto: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 60,
  },
  boton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginVertical: 10,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 5,
  },
  textoBoton: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});