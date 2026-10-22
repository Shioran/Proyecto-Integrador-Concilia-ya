import apiClient from './apiClient.js';

// /api/conflictos — el backend filtra según el rol del token:
// Admin ve todos, Mediador los propios + asignados, Usuario donde es parte.
export const conflictosApi = {
  listar: () => apiClient.get('/conflictos').then((r) => r.data),
  obtener: (id) => apiClient.get(`/conflictos/${id}`).then((r) => r.data),
  // body: { usuarioDemandadoId, tipoConflictoId, asunto, descripcion?, montoReclamado? }
  crear: (datos) => apiClient.post('/conflictos', datos).then((r) => r.data),
  actualizar: (id, datos) => apiClient.put(`/conflictos/${id}`, datos).then((r) => r.data),
  cancelar: (id) => apiClient.delete(`/conflictos/${id}`), // baja lógica, solo si está ABIERTO
};
