import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

// Layout de las pantallas privadas: barra de navegación fija + contenido de la ruta hija.
export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
