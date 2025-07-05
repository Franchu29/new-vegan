import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Image} from 'react-native';
import { Feather } from '@expo/vector-icons';

const fondo = require('../assets/fondo.webp');
const logo = require('../assets/Logo_Blanco.webp');

export default function HomeScreen({ navigation }) {
  return (
    <ImageBackground source={fondo} style={styles.background}>
      <View style={styles.configContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Configuracion')}>
          <Feather name="settings" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.overlay}>
        <Image source={logo} style={styles.logo} />

        <TouchableOpacity 
            style={styles.boton}
            onPress={() => navigation.navigate('MesaComanda')}
        >
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
  configContainer: {
    position: 'absolute',
    top: 50,
    right: 30,
    zIndex: 10,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: -80,
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
  logo: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 120,
  }
});