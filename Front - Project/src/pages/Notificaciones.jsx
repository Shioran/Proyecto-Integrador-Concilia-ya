import { useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { notificacionesApi } from '../api/notificacionesApi.js';
import { formatFecha } from '../utils/format.js';
import { getErrorMessage } from '../utils/errors.js';
import PageHeader from '../components/PageHeader.jsx';
import Async from '../components/Async.jsx';
import Alert from '../components/Alert.jsx';

export default function Notificaciones() {
  const { data, loading, error, reload } = useFetch(notificacionesApi.mias);
  const [errorAccion, setErrorAccion] = useState('');
  const lista = data || [];
  const sinLeer = lista.filter((n) => !n.leida).length;

  const ejecutar = async (accion) => {
    setErrorAccion('');
    try { await accion(); reload(); } catch (e) { setErrorAccion(getErrorMessage(e)); }
  };

  return (
    <>
      <PageHeader titulo="Notificaciones" subtitulo={`${sinLeer} sin leer`}>
        {sinLeer > 0 && (
          <button className="btn-secondary" onClick={() => ejecutar(notificacionesApi.marcarTodasLeidas)}>
            Marcar todas como leídas
          </button>
        )}
      </PageHeader>

      <div className="card">
        <Alert>{errorAccion}</Alert>
        <Async loading={loading} error={error} onRetry={reload}>
          {lista.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No tienes notificaciones.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {lista.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className={`text-sm ${n.leida ? 'text-slate-500' : 'font-semibold text-slate-900'}`}>{n.mensaje}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{formatFecha(n.fecha)}</p>
                  </div>
                  {!n.leida && (
                    <button className="shrink-0 text-xs font-medium text-indigo-600 hover:underline"
                      onClick={() => ejecutar(() => notificacionesApi.marcarLeida(n.id))}>
                      Marcar leída
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Async>
      </div>
    </>
  );
}
