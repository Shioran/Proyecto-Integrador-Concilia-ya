export const formatFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

export const formatMonto = (n) =>
  n == null
    ? '—'
    : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

// <input type="datetime-local"> entrega "2026-10-21T14:30", que el backend (LocalDateTime) acepta tal cual.
// Esta función recorta un ISO del backend para precargar ese input al editar.
export const aInputFecha = (iso) => (iso ? iso.slice(0, 16) : '');
