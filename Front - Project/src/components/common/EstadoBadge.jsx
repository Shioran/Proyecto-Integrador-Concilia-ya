import { ESTADO_INFO, getEstadoCodigo } from '../../utils/estados.js';

// Etiqueta de color según el estado del conflicto o de la mediación.
export default function EstadoBadge({ item }) {
  const codigo = getEstadoCodigo(item);
  const info = ESTADO_INFO[codigo] || { label: codigo || '—', clases: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${info.clases}`}>
      {info.label}
    </span>
  );
}
