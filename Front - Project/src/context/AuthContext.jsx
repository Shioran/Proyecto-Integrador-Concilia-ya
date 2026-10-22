import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi.js';
import { setUnauthorizedHandler } from '../api/apiClient.js';
import { tokenStorage, isTokenExpired } from '../api/tokenStorage.js';
import { resolverRol } from '../utils/roles.js';

// ─────────────────────────────────────────────────────────────
// AuthContext: de aquí sale el ESTADO DE SESIÓN para toda la app.
//   user    → { id, nombre, correo, perfilId, rol } o null si no hay sesión
//   loading → true mientras al arrancar comprobamos si había una sesión guardada
// Cualquier componente lo lee con:  const { user, login, logout } = useAuth();
// ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null); // al quedar user=null, ProtectedRoute redirige solo a /login
  }, []);

  // Si el backend responde 401 en cualquier llamada, cerramos sesión (ver apiClient.js)
  useEffect(() => { setUnauthorizedHandler(logout); }, [logout]);

  // Al cargar la página (o presionar F5) recuperamos la sesión guardada.
  useEffect(() => {
    const token = tokenStorage.getToken();
    if (!token || isTokenExpired(token)) {
      tokenStorage.clear();
      setLoading(false);
      return;
    }
    // Preguntamos al backend "¿quién soy?" para confirmar que el token sigue siendo válido.
    authApi.me()
      .then((me) => {
        const usuario = { ...tokenStorage.getUser(), ...me };
        usuario.rol = resolverRol(usuario);
        setUser(usuario);
      })
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  // Login: pide el token, lo guarda y actualiza el estado global.
  const login = async (correo, password) => {
    const { token, ...datos } = await authApi.login(correo, password);
    const usuario = { ...datos, rol: resolverRol(datos) };
    tokenStorage.saveSession(token, usuario);
    setUser(usuario);
    return usuario;
  };

  // Registro: crea la cuenta pero NO inicia sesión; el usuario pasa por /login.
  const register = (datos) => authApi.register(datos);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
