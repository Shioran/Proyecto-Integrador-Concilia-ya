import apiClient from './apiClient.js';

// Tipos de conflicto: todos pueden leer (el no-admin solo ve los activos);
// crear / editar / dar de baja es solo ADMIN.
export const tiposConflictoApi = {
  listar: () => apiClient.get('/tipos-conflicto').then((r) => r.data),
  crear: (datos) => apiClient.post('/tipos-conflicto', datos).then((r) => r.data),
  actualizar: (id, datos) => apiClient.put(`/tipos-conflicto/${id}`, datos).then((r) => r.data),
  desactivar: (id) => apiClient.delete(`/tipos-conflicto/${id}`),
};

// Estados: solo lectura (el cliente nunca fija el estado de un conflicto).
export const estadosConflictoApi = {
  listar: () => apiClient.get('/estados-conflicto').then((r) => r.data),
};

// Perfiles: solo se usa para el <select> del formulario de usuarios (ADMIN).
export const perfilesApi = {
  listar: () => apiClient.get('/perfiles').then((r) => r.data),
};
