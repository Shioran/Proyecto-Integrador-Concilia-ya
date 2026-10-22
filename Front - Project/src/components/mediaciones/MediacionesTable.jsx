import { Link } from 'react-router-dom';
import EstadoBadge from '../common/EstadoBadge.jsx';
import { formatFecha } from '../../utils/format.js';

// Tabla reutilizable de mediaciones (pantalla Mediaciones y Dashboard del mediador).
export default function MediacionesTable({ mediaciones }) {
  if (mediaciones.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">No hay mediaciones para mostrar.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr>
            <th className="th">#</th><th className="th">Conflicto</th><th className="th">Mediador</th>
            <th className="th">Estado</th><th className="th">Programada</th><th className="th">Lugar</th>
            <th className="th" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {mediaciones.map((m) => (
            <tr key={m.id} className="hover:bg-slate-50">
              <td className="td">{m.id}</td>
              <td className="td">
                <Link to={`/conflictos/${m.conflictoId}`} className="text-indigo-600 hover:underline">
                  Conflicto #{m.conflictoId}
                </Link>
              </td>
              <td className="td">{m.mediadorNombre}</td>
              <td className="td"><EstadoBadge item={m} /></td>
              <td className="td">{formatFecha(m.fechaProgramada)}</td>
              <td className="td">{m.lugar || '—'}</td>
              <td className="td text-right">
                <Link to={`/mediaciones/${m.id}`} className="font-medium text-indigo-600 hover:underline">Ver</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
