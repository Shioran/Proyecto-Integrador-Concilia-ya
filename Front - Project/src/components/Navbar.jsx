import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { notificacionesApi } from '../api/notificacionesApi.js';
import { ROLES, ROL_LABEL } from '../utils/roles.js';

// Menú declarativo: cada opción dice qué roles la pueden ver.
// Para agregar una pantalla al menú basta con agregar una línea aquí.
const MENU = [
  { to: '/dashboard', texto: 'Inicio', roles: [ROLES.ADMIN, ROLES.MEDIADOR, ROLES.USUARIO] },
  { to: '/conflictos', texto: 'Conflictos', textoUsuario: 'Mis conflictos', roles: [ROLES.ADMIN, ROLES.MEDIADOR, ROLES.USUARIO] },
  { to: '/mediaciones', texto: 'Mediaciones', roles: [ROLES.ADMIN, ROLES.MEDIADOR, ROLES.USUARIO] },
  { to: '/admin/tipos-conflicto', texto: 'Tipos de conflicto', roles: [ROLES.ADMIN] },
  { to: '/admin/usuarios', texto: 'Usuarios', roles: [ROLES.ADMIN] },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [noLeidas, setNoLeidas] = useState(0);

  // Contador de notificaciones: se refresca al cambiar de pantalla y cada 30 s
  useEffect(() => {
    const cargar = () => notificacionesApi.contarNoLeidas().then(setNoLeidas).catch(() => {});
    cargar();
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo); // limpieza al desmontar
  }, [location.pathname]);

  const claseLink = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium ${
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/dashboard" className="mr-4 flex items-center gap-2 font-bold text-slate-900">
          <img src="/logo.svg" alt="" className="h-7 w-7" /> ConciliaYa
        </Link>

        <nav className="flex flex-1 flex-wrap gap-1">
          {MENU.filter((m) => m.roles.includes(user.rol)).map((m) => (
            <NavLink key={m.to} to={m.to} className={claseLink}>
              {user.rol === ROLES.USUARIO && m.textoUsuario ? m.textoUsuario : m.texto}
            </NavLink>
          ))}
        </nav>

        <Link to="/notificaciones" className="relative rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
          🔔
          {noLeidas > 0 && (
            <span className="absolute -right-0.5 -top-0.5 rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
              {noLeidas}
            </span>
          )}
        </Link>

        <div className="text-right text-sm leading-tight">
          <p className="font-medium text-slate-900">{user.nombre}</p>
          <p className="text-xs text-slate-500">{ROL_LABEL[user.rol]}</p>
        </div>
        <button onClick={logout} className="btn-secondary">Salir</button>
      </div>
    </header>
  );
}
