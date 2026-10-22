import axios from 'axios';
import { tokenStorage } from './tokenStorage.js';

// Instancia única de axios. Todas las llamadas de src/api/* pasan por aquí.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
});

// 1) INTERCEPTOR DE PETICIÓN: antes de enviar, adjunta el JWT si existe.
//    Así ninguna pantalla se preocupa por el header Authorization.
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 2) INTERCEPTOR DE RESPUESTA: si el backend responde 401 (token vencido o inválido)
//    cerramos sesión. El AuthContext registra qué hacer (ver setUnauthorizedHandler).
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const esLogin = error.config?.url?.includes('/auth/login');
    // En el login un 401 significa "credenciales incorrectas", no "sesión vencida".
    if (error.response?.status === 401 && !esLogin) onUnauthorized();
    return Promise.reject(error);
  }
);

export default apiClient;
