// routes.js
import { Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import MesaComanda from './screens/MesaComanda';
import Configuracion from './screens/Configuracion';
import IngresoNombreCliente from './screens/IngresoNombreCliente';
import Platos from './screens/Platos';
import PlatoEspecifico from './screens/PlatoEspecifico';
import ResumenPedido from './screens/ResumenPedido';
import Mesas from './screens/Mesas';
import EditarPlato from './screens/EditarPlato';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/mesacomanda" element={<MesaComanda />} />
      <Route path="/configuracion" element={<Configuracion />} />
      <Route path="/ingresonombrecliente" element={<IngresoNombreCliente />} />
      <Route path="/platos" element={<Platos />} />
      <Route path="/platoespecifico" element={<PlatoEspecifico />} />
      <Route path="/resumenpedido" element={<ResumenPedido />} />
      <Route path="/mesa" element={<Mesas />} />
      <Route path="/editarplato" element={<EditarPlato />} />
    </Routes>
  );
}
