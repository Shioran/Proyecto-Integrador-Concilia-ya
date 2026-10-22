import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuth.js';
import Forbidden from '../../pages/common/Forbidden.jsx';

// ─────────────────────────────────────────────────────────────
// Guardia de rutas. Se usa como "ruta padre" en App.jsx:
//   <Route element={<ProtectedRoute />}>                       → exige sesión
//   <Route element={<ProtectedRoute roles={['ADMIN']} />}>     → exige sesión + rol
// Si todo está bien renderiza <Outlet />, que es donde se pinta la ruta hija.
//
// IMPORTANTE: esto solo mejora la experiencia (oculta pantallas). La seguridad real
// está en el backend: aunque alguien manipule el frontend, la API responde 403.
// ─────────────────────────────────────────────────────────────
export default function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Guardamos a dónde quería ir para volver ahí tras el login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles && !roles.includes(user.rol)) return <Forbidden />;
  return <Outlet />;
}
