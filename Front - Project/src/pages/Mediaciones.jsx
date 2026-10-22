import { useFetch } from '../hooks/useFetch.js';
import { mediacionesApi } from '../api/mediacionesApi.js';
import PageHeader from '../components/PageHeader.jsx';
import Async from '../components/Async.jsx';
import MediacionesTable from '../components/MediacionesTable.jsx';

// El backend decide qué mediaciones ve cada rol (Admin: todas · Mediador: asignadas · Usuario: donde es parte)
export default function Mediaciones() {
  const { data, loading, error, reload } = useFetch(mediacionesApi.listar);
  return (
    <>
      <PageHeader titulo="Mediaciones" subtitulo="Seguimiento de los procesos de mediación" />
      <div className="card">
        <Async loading={loading} error={error} onRetry={reload}>
          <MediacionesTable mediaciones={data || []} />
        </Async>
      </div>
    </>
  );
}
