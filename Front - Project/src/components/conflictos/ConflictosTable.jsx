import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuth.js';
import EstadoBadge from '../common/EstadoBadge.jsx';
import { formatFecha, formatMonto } from '../../utils/format.js';

// Tabla reutilizable de conflictos (Mis conflictos y Dashboards).
// Recibe los datos por props: el componente solo PINTA, no pide nada al backend.
export default function ConflictosTable({ conflictos }) {
  const { user } = useAuth();

  // ¿Qué papel juega el usuario actual en este conflicto?
  const miPapel = (c) => {
    if (c.demandanteId === user.id) return 'Demandante';
    if (c.demandadoId === user.id) return 'Demandado';
    if (c.mediadorId === user.id) return 'Mediador';
    return '—';
  };

  if (conflictos.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">No hay conflictos para mostrar.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr>
            <th className="th">#</th><th className="th">Asunto</th><th className="th">Tipo</th>
            <th className="th">Mi papel</th><th className="th">Estado</th>
            <th className="th">Monto</th><th className="th">Fecha</th><th className="th" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {conflictos.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="td">{c.id}</td>
              <td className="td font-medium text-slate-900">{c.asunto}</td>
              <td className="td">{c.tipoConflictoNombre}</td>
              <td className="td">{miPapel(c)}</td>
              <td className="td"><EstadoBadge item={c} /></td>
              <td className="td">{formatMonto(c.montoReclamado)}</td>
              <td className="td">{formatFecha(c.fechaInicio)}</td>
              <td className="td text-right">
                <Link to={`/conflictos/${c.id}`} className="font-medium text-indigo-600 hover:underline">Ver</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
