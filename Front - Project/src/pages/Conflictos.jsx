import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { conflictosApi } from '../api/conflictosApi.js';
import { ESTADOS, ESTADO_INFO, getEstadoCodigo } from '../utils/estados.js';
import { ROLES } from '../utils/roles.js';
import PageHeader from '../components/PageHeader.jsx';
import Async from '../components/Async.jsx';
import ConflictosTable from '../components/ConflictosTable.jsx';

// LISTA DE CONFLICTOS (para el Usuario se titula "Mis conflictos").
// Aquí los filtros son componentes controlados con useState "a mano":
// el valor de cada control vive en el estado y la lista se recalcula en cada render.
export default function Conflictos() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(conflictosApi.listar);

  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');

  // Filtrado en el cliente: no necesita otra petición al backend
  const filtrados = (data || []).filter(
    (c) =>
      c.asunto.toLowerCase().includes(busqueda.toLowerCase()) &&
      (estado === '' || getEstadoCodigo(c) === estado)
  );

  return (
    <>
      <PageHeader
        titulo={user.rol === ROLES.USUARIO ? 'Mis conflictos' : 'Conflictos'}
        subtitulo="Radica, consulta y haz seguimiento de los conflictos"
      >
        <Link to="/conflictos/nuevo" className="btn-primary">+ Nuevo conflicto</Link>
      </PageHeader>

      <div className="card">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <input
            className="input" placeholder="Buscar por asunto…"
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          />
          <select className="input" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {Object.values(ESTADOS).map((e) => (
              <option key={e} value={e}>{ESTADO_INFO[e].label}</option>
            ))}
          </select>
        </div>

        <Async loading={loading} error={error} onRetry={reload}>
          <ConflictosTable conflictos={filtrados} />
        </Async>
      </div>
    </>
  );
}
