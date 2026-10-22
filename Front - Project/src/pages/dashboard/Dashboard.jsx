import { useAuth } from '../../hooks/auth/useAuth.js';
import { ROLES } from '../../utils/roles.js';
import DashboardAdmin from './DashboardAdmin.jsx';
import DashboardMediador from './DashboardMediador.jsx';
import DashboardUsuario from './DashboardUsuario.jsx';

// Un solo path (/dashboard), tres pantallas distintas según el rol del token.
// "Renderizado condicional": React decide qué componente pintar según el estado `user`.
export default function Dashboard() {
  const { user } = useAuth();
  if (user.rol === ROLES.ADMIN) return <DashboardAdmin />;
  if (user.rol === ROLES.MEDIADOR) return <DashboardMediador />;
  return <DashboardUsuario />;
}
