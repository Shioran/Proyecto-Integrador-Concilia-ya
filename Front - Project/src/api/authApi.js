import apiClient from './apiClient.js';

// Capa de servicios de autenticación: solo habla HTTP, no guarda estado.
// El estado de sesión vive en AuthContext.
export const authApi = {
  // → { token, id, nombre, correo, perfilId, rol }
  login: (correo, password) =>
    apiClient.post('/auth/login', { correo, password }).then((r) => r.data),

  // El backend siempre crea el usuario con perfil 3 (Usuario)
  register: (datos) =>
    apiClient.post('/auth/register', datos).then((r) => r.data),

  me: () => apiClient.get('/auth/me').then((r) => r.data),
};
