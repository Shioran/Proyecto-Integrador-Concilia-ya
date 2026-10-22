// ─────────────────────────────────────────────────────────────
// Validadores reutilizables para formularios.
// Cada validador es una función (valor, todosLosValores) → 'mensaje de error' | ''.
// Se combinan con `validar(...)`, que devuelve el primer error que encuentre.
// ─────────────────────────────────────────────────────────────
export const requerido = (msg = 'Este campo es obligatorio') => (v) =>
  v === undefined || v === null || String(v).trim() === '' ? msg : '';

export const correoValido = () => (v) =>
  v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Ingresa un correo válido' : '';

export const minimo = (n) => (v) =>
  v && v.length < n ? `Debe tener al menos ${n} caracteres` : '';

export const maximo = (n) => (v) =>
  v && v.length > n ? `No puede superar ${n} caracteres` : '';

export const numeroNoNegativo = () => (v) =>
  v !== '' && (isNaN(Number(v)) || Number(v) < 0) ? 'Debe ser un número mayor o igual a 0' : '';

export const igualA = (otroCampo, msg) => (v, todos) =>
  v !== todos[otroCampo] ? msg : '';

export const validar = (...validadores) => (valor, todos) => {
  for (const fn of validadores) {
    const error = fn(valor, todos);
    if (error) return error;
  }
  return '';
};
