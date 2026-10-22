// Convierte un error de axios en un mensaje legible para el usuario.
// El backend responde: { timestamp, status, error, message, path, fieldErrors? }
export function getErrorMessage(error) {
  if (error.response) return error.response.data?.message || 'Ocurrió un error en el servidor.';
  if (error.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder.';
  return 'No se pudo conectar con el servidor. ¿Está encendido el backend?';
}

// Errores de validación por campo que envía el backend → { campo: 'mensaje' }.
// Acepta objeto { campo: msg } o lista [{ field, message }].
export function getFieldErrors(error) {
  const fe = error.response?.data?.fieldErrors;
  if (!fe) return {};
  if (Array.isArray(fe)) {
    return Object.fromEntries(fe.map((e) => [e.field, e.message || e.defaultMessage]));
  }
  return fe;
}
