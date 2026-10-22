// Roles que devuelve el backend en el login (campo "rol").
export const ROLES = {
  ADMIN: 'ADMIN',
  MEDIADOR: 'MEDIADOR',
  USUARIO: 'USUARIO',
};

export const ROL_LABEL = {
  ADMIN: 'Administrador',
  MEDIADOR: 'Mediador',
  USUARIO: 'Usuario',
};

// Respaldo por si el backend solo enviara perfilId (1→ADMIN, 2→MEDIADOR, 3→USUARIO).
const ROL_POR_PERFIL = { 1: ROLES.ADMIN, 2: ROLES.MEDIADOR, 3: ROLES.USUARIO };

export const resolverRol = (u) => u?.rol || ROL_POR_PERFIL[u?.perfilId] || ROLES.USUARIO;
