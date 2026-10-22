import apiClient from './apiClient.js';

export const usuariosApi = {
  // Cualquier usuario autenticado: candidatos a "demandado" → [{ id, nombre }]
  directorio: () => apiClient.get('/usuarios/directorio').then((r) => r.data),
  // ADMIN: mediadores activos para asignar → [{ id, nombre }]
  mediadores: () => apiClient.get('/usuarios/mediadores').then((r) => r.data),

  // CRUD completo, solo ADMIN
  listar: () => apiClient.get('/usuarios').then((r) => r.data),
  crear: (datos) => apiClient.post('/usuarios', datos).then((r) => r.data),
  actualizar: (id, datos) => apiClient.put(`/usuarios/${id}`, datos).then((r) => r.data),
  desactivar: (id) => apiClient.delete(`/usuarios/${id}`), // baja lógica
};
