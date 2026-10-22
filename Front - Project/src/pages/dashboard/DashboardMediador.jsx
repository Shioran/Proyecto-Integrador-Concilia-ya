import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuth.js';
import { useFetch } from '../../hooks/common/useFetch.js';
import { mediacionesApi } from '../../api/mediacionesApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';
import Async from '../../components/common/Async.jsx';
import MediacionesTable from '../../components/mediaciones/MediacionesTable.jsx';

export default function DashboardMediador() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(mediacionesApi.listar);

  // Solo las mediaciones asignadas a mí
  const mias = (data || []).filter((m) => m.mediadorId === user.id);
  const activas = mias.filter((m) => m.activo);

  return (
    <>
      <PageHeader titulo={`Hola, ${user.nombre}`} subtitulo="Tus mediaciones asignadas">
        <Link to="/mediaciones" className="btn-secondary">Ver todas</Link>
      </PageHeader>

      <Async loading={loading} error={error} onRetry={reload}>
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard titulo="Asignadas" valor={mias.length} />
          <StatCard titulo="En curso" valor={activas.length} color="text-amber-600" />
          <StatCard titulo="Finalizadas" valor={mias.length - activas.length} color="text-green-600" />
        </div>
        <div className="card">
          <h2 className="mb-2 font-semibold">Mediaciones en curso</h2>
          <MediacionesTable mediaciones={activas} />
        </div>
      </Async>
    </>
  );
}
