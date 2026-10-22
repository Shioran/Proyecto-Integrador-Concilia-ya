import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { conflictosApi } from '../../api/conflictosApi.js';
import { getEstadoCodigo, ESTADOS } from '../../utils/estados.js';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import Async from '../../components/Async.jsx';
import ConflictosTable from '../../components/ConflictosTable.jsx';

export default function DashboardUsuario() {
  const { user } = useAuth();
  // El backend ya filtra: solo llegan los conflictos donde este usuario es parte
  const { data, loading, error, reload } = useFetch(conflictosApi.listar);
  const conflictos = data || [];

  const cuenta = (...estados) =>
    conflictos.filter((c) => estados.includes(getEstadoCodigo(c))).length;

  return (
    <>
      <PageHeader titulo={`Hola, ${user.nombre}`} subtitulo="Resumen de tus conflictos">
        <Link to="/conflictos/nuevo" className="btn-primary">+ Nuevo conflicto</Link>
      </PageHeader>

      <Async loading={loading} error={error} onRetry={reload}>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard titulo="Total" valor={conflictos.length} />
          <StatCard titulo="Abiertos" valor={cuenta(ESTADOS.ABIERTO)} color="text-blue-600" />
          <StatCard titulo="En mediación" valor={cuenta(ESTADOS.EN_MEDIACION)} color="text-amber-600" />
          <StatCard titulo="Finalizados" valor={cuenta(ESTADOS.RESUELTO, ESTADOS.CERRADO)} color="text-green-600" />
        </div>
        <div className="card">
          <h2 className="mb-2 font-semibold">Últimos conflictos</h2>
          <ConflictosTable conflictos={conflictos.slice(0, 5)} />
        </div>
      </Async>
    </>
  );
}
