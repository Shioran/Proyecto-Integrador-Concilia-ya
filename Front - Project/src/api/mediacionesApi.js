import apiClient from './apiClient.js';

export const mediacionesApi = {
  listar: () => apiClient.get('/mediaciones').then((r) => r.data),
  obtener: (id) => apiClient.get(`/mediaciones/${id}`).then((r) => r.data),

  // ADMIN: asigna mediador → el conflicto pasa a EN_MEDIACION
  // body: { conflictoId, mediadorId, fechaProgramada?, lugar? }
  asignar: (datos) => apiClient.post('/mediaciones', datos).then((r) => r.data),

  // ADMIN: mediadorId / fecha / lugar · MEDIADOR: observaciones
  actualizar: (id, datos) => apiClient.put(`/mediaciones/${id}`, datos).then((r) => r.data),

  // Sesiones de una mediación
  listarSesiones: (id) => apiClient.get(`/mediaciones/${id}/sesiones`).then((r) => r.data),
  // body: { fecha, lugar?, observaciones }
  registrarSesion: (id, datos) =>
    apiClient.post(`/mediaciones/${id}/sesiones`, datos).then((r) => r.data),

  // MEDIADOR: cierra la mediación. body: { acuerdo: boolean, detalle }
  dictaminar: (id, datos) => apiClient.post(`/mediaciones/${id}/dictamen`, datos).then((r) => r.data),
};
