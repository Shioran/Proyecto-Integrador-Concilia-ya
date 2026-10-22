import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/auth/useAuth.js';
import { ROLES } from './utils/roles.js';
import Loading from './components/common/Loading.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import Conflictos from './pages/conflictos/Conflictos.jsx';
import ConflictoForm from './pages/conflictos/ConflictoForm.jsx';
import ConflictoDetalle from './pages/conflictos/ConflictoDetalle.jsx';
import Mediaciones from './pages/mediaciones/Mediaciones.jsx';
import MediacionDetalle from './pages/mediaciones/MediacionDetalle.jsx';
import Notificaciones from './pages/notificaciones/Notificaciones.jsx';
import TiposConflicto from './pages/admin/TiposConflicto.jsx';
import Usuarios from './pages/admin/Usuarios.jsx';
import NotFound from './pages/common/NotFound.jsx';

// ─────────────────────────────────────────────────────────────
// MAPA DE RUTAS de la aplicación (React Router v6, rutas anidadas):
//   Públicas ........ /login, /register
//   Con sesión ...... ProtectedRoute → AppLayout (barra de navegación) → páginas
//   Solo ADMIN ...... ProtectedRoute roles={['ADMIN']}
// ─────────────────────────────────────────────────────────────
export default function App() {
  const { user, loading } = useAuth();

  // Mientras se verifica la sesión guardada no decidimos nada (evita "parpadeo" al login)
  if (loading) return <Loading texto="Verificando sesión…" />;

  return (
    <Routes>
      {/* Públicas: si ya hay sesión, redirigimos al dashboard */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Privadas: cualquier usuario autenticado */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/conflictos" element={<Conflictos />} />
          <Route path="/conflictos/nuevo" element={<ConflictoForm />} />
          <Route path="/conflictos/:id" element={<ConflictoDetalle />} />
          <Route path="/conflictos/:id/editar" element={<ConflictoForm />} />
          <Route path="/mediaciones" element={<Mediaciones />} />
          <Route path="/mediaciones/:id" element={<MediacionDetalle />} />
          <Route path="/notificaciones" element={<Notificaciones />} />

          {/* Privadas: solo ADMIN */}
          <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
            <Route path="/admin/tipos-conflicto" element={<TiposConflicto />} />
            <Route path="/admin/usuarios" element={<Usuarios />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
