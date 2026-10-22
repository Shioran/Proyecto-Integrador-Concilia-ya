import { useContext } from 'react';
import { AuthContext } from '../../states/AuthContext.jsx';

// Hook para leer el estado de sesión desde cualquier componente:
//   const { user, loading, login, register, logout } = useAuth();
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
