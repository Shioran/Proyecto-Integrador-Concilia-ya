import apiClient from './apiClient.js';

export const notificacionesApi = {
  mias: () => apiClient.get('/notificaciones/mias').then((r) => r.data),
  contarNoLeidas: () =>
    apiClient.get('/notificaciones/mias/no-leidas/count').then((r) => r.data.count),
  marcarLeida: (id) => apiClient.patch(`/notificaciones/${id}/leida`),
  marcarTodasLeidas: () => apiClient.patch('/notificaciones/mias/leidas'),
};
