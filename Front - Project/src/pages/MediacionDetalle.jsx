import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { mediacionesApi } from '../api/mediacionesApi.js';
import { ROLES } from '../utils/roles.js';
import { formatFecha } from '../utils/format.js';
import PageHeader from '../components/PageHeader.jsx';
import Async from '../components/Async.jsx';
import EstadoBadge from '../components/EstadoBadge.jsx';
import SesionForm from '../components/SesionForm.jsx';
import DictamenForm from '../components/DictamenForm.jsx';
import ObservacionesForm from '../components/ObservacionesForm.jsx';
import MediacionAdminForm from '../components/MediacionAdminForm.jsx';

const RESULTADO = { ACUERDO: 'Hubo acuerdo', SIN_ACUERDO: 'Sin acuerdo' };

export default function MediacionDetalle() {
  const { id } = useParams();
  const { user } = useAuth();

  const mediacion = useFetch(() => mediacionesApi.obtener(id), [id]);
  const sesiones = useFetch(() => mediacionesApi.listarSesiones(id), [id]);

  const m = mediacion.data;
  const recargarTodo = () => { mediacion.reload(); sesiones.reload(); };

  // Qué puede hacer cada rol en esta pantalla:
  const enCurso = m?.activo;                                   // false cuando ya hay dictamen
  const esMediador = m?.mediadorId === user.id;                // el mediador ASIGNADO
  const esAdmin = user.rol === ROLES.ADMIN;

  return (
    <Async loading={mediacion.loading} error={mediacion.error} onRetry={mediacion.reload}>
      {m && (
        <>
          <PageHeader titulo={`Mediación #${m.id}`} subtitulo={`Conflicto #${m.conflictoId}`}>
            <Link to={`/conflictos/${m.conflictoId}`} className="btn-secondary">Ver conflicto</Link>
          </PageHeader>

          <div className="space-y-6">
            <section className="card grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div><p className="text-xs font-semibold uppercase text-slate-500">Estado</p><div className="mt-1"><EstadoBadge item={m} /></div></div>
              <div><p className="text-xs font-semibold uppercase text-slate-500">Mediador</p><p className="mt-1">{m.mediadorNombre}</p></div>
              <div><p className="text-xs font-semibold uppercase text-slate-500">Programada</p><p className="mt-1">{formatFecha(m.fechaProgramada)}</p></div>
              <div><p className="text-xs font-semibold uppercase text-slate-500">Lugar</p><p className="mt-1">{m.lugar || '—'}</p></div>
              {!enCurso && (
                <div className="sm:col-span-2 lg:col-span-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">Resultado del dictamen</p>
                  <p className="mt-1 font-medium">{RESULTADO[m.resultado] || m.resultado || '—'}</p>
                </div>
              )}
              {m.observaciones && (
                <div className="sm:col-span-2 lg:col-span-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">Observaciones</p>
                  <p className="mt-1 whitespace-pre-line">{m.observaciones}</p>
                </div>
              )}
            </section>

            {/* Lista de sesiones registradas */}
            <section className="card">
              <h2 className="mb-3 font-semibold">Sesiones</h2>
              <Async loading={sesiones.loading} error={sesiones.error} onRetry={sesiones.reload}>
                {(sesiones.data || []).length === 0 ? (
                  <p className="text-sm text-slate-500">Aún no hay sesiones registradas.</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {sesiones.data.map((s, i) => (
                      <li key={s.id ?? i} className="py-3 text-sm">
                        <p className="font-medium">{formatFecha(s.fecha)}{s.lugar && ` · ${s.lugar}`}</p>
                        <p className="mt-1 whitespace-pre-line text-slate-600">{s.observaciones}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </Async>
            </section>

            {/* ── Acciones del MEDIADOR asignado (solo mientras la mediación esté en curso) ── */}
            {enCurso && esMediador && (
              <>
                <section className="card">
                  <h2 className="mb-4 font-semibold">Registrar sesión</h2>
                  <SesionForm mediacionId={m.id} onSaved={recargarTodo} />
                </section>
                <section className="card">
                  <h2 className="mb-4 font-semibold">Observaciones generales</h2>
                  <ObservacionesForm mediacion={m} onSaved={mediacion.reload} />
                </section>
                <section className="card border-red-200">
                  <h2 className="mb-1 font-semibold">Dictamen final</h2>
                  <p className="mb-4 text-sm text-slate-500">Cierra la mediación: el conflicto quedará «Resuelto» o «Cerrado».</p>
                  <DictamenForm mediacionId={m.id} onSaved={recargarTodo} />
                </section>
              </>
            )}

            {/* ── Acción del ADMIN: reprogramar o reasignar ── */}
            {enCurso && esAdmin && (
              <section className="card">
                <h2 className="mb-4 font-semibold">Reprogramar o reasignar</h2>
                <MediacionAdminForm mediacion={m} onSaved={mediacion.reload} />
              </section>
            )}
          </div>
        </>
      )}
    </Async>
  );
}
