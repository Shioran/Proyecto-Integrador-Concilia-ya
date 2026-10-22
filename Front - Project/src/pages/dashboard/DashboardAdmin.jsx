import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import { conflictosApi } from '../../api/conflictosApi.js';
import { getEstadoCodigo, ESTADOS } from '../../utils/estados.js';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import Async from '../../components/Async.jsx';
import ConflictosTable from '../../components/ConflictosTable.jsx';

export default function DashboardAdmin() {
  const { data, loading, error, reload } = useFetch(conflictosApi.listar);
  const conflictos = data || [];

  const porEstado = (estado) => conflictos.filter((c) => getEstadoCodigo(c) === estado);
  const pendientes = porEstado(ESTADOS.ABIERTO); // esperan que el Admin asigne un mediador

  return (
    <>
      <PageHeader titulo="Panel de administración" subtitulo="Estado general de la plataforma">
        <Link to="/admin/usuarios" className="btn-secondary">Usuarios</Link>
      </PageHeader>

      <Async loading={loading} error={error} onRetry={reload}>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard titulo="Conflictos totales" valor={conflictos.length} />
          <StatCard titulo="Pendientes de asignar" valor={pendientes.length} color="text-blue-600" />
          <StatCard titulo="En mediación" valor={porEstado(ESTADOS.EN_MEDIACION).length} color="text-amber-600" />
          <StatCard titulo="Finalizados" valor={porEstado(ESTADOS.RESUELTO).length + porEstado(ESTADOS.CERRADO).length} color="text-green-600" />
        </div>
        <div className="card">
          <h2 className="mb-1 font-semibold">Pendientes de asignar mediador</h2>
          <p className="mb-2 text-sm text-slate-500">Abre un conflicto y asígnale un mediador.</p>
          <ConflictosTable conflictos={pendientes} />
        </div>
      </Async>
    </>
  );
}
