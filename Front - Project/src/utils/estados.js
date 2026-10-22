// Máquina de estados del conflicto (la define el backend; el cliente nunca la cambia):
//   ABIERTO → EN_MEDIACION → RESUELTO (hubo acuerdo) | CERRADO (sin acuerdo)
export const ESTADOS = {
  ABIERTO: 'ABIERTO',
  EN_MEDIACION: 'EN_MEDIACION',
  RESUELTO: 'RESUELTO',
  CERRADO: 'CERRADO',
  CANCELADO: 'CANCELADO', // conflicto con activo=false
};

export const ESTADO_INFO = {
  ABIERTO: { label: 'Abierto', clases: 'bg-blue-100 text-blue-800' },
  EN_MEDIACION: { label: 'En mediación', clases: 'bg-amber-100 text-amber-800' },
  RESUELTO: { label: 'Resuelto', clases: 'bg-green-100 text-green-800' },
  CERRADO: { label: 'Cerrado', clases: 'bg-slate-200 text-slate-700' },
  CANCELADO: { label: 'Cancelado', clases: 'bg-red-100 text-red-700' },
};

// "En mediación" → "EN_MEDIACION" (sin tildes, mayúsculas, espacios → _)
const normalizar = (texto = '') =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase().replace(/\s+/g, '_');

// Obtiene el código de estado de un Conflicto o de una Mediación.
// La mediación trae estadoCodigo/estadoNombre; el conflicto, estadoConflictoNombre.
export function getEstadoCodigo(item) {
  if (item?.activo === false && item?.estadoConflictoNombre !== undefined) {
    // Un conflicto cancelado (baja lógica) se muestra aparte
    const codigo = normalizar(item.estadoConflictoNombre);
    return codigo === ESTADOS.ABIERTO ? ESTADOS.CANCELADO : codigo;
  }
  return item?.estadoCodigo || normalizar(item?.estadoNombre || item?.estadoConflictoNombre);
}
