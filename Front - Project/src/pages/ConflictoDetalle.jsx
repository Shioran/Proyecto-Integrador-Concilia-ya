import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { conflictosApi } from '../api/conflictosApi.js';
import { mediacionesApi } from '../api/mediacionesApi.js';
import { usuariosApi } from '../api/usuariosApi.js';
import { getEstadoCodigo, ESTADOS } from '../utils/estados.js';
import { ROLES } from '../utils/roles.js';
import { formatFecha, formatMonto } from '../utils/format.js';
import { getErrorMessage } from '../utils/errors.js';
import PageHeader from '../components/PageHeader.jsx';
import Async from '../components/Async.jsx';
import Alert from '../components/Alert.jsx';
import EstadoBadge from '../components/EstadoBadge.jsx';
import MediacionAdminForm from '../components/MediacionAdminForm.jsx';

function Dato({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children || '—'}</dd>
    </div>
  );
}

export default function ConflictoDetalle() {
  const { id } = useParams();            // el :id de la URL /conflictos/:id
  const { user } = useAuth();
  const navigate = useNavigate();
  const [errorAccion, setErrorAccion] = useState('');

  // Tres peticiones independientes; cada una controla su propio loading/error.
  const conflicto = useFetch(() => conflictosApi.obtener(id), [id]);
  const mediaciones = useFetch(() => mediacionesApi.listar(), [id]);
  const directorio = useFetch(() => usuariosApi.directorio(), []);

  const c = conflicto.data;

  // El backend devuelve ids de las partes; el directorio nos permite mostrar nombres.
  const nombreDe = (userId) => {
    if (userId === user.id) return `${user.nombre} (tú)`;
    return (directorio.data || []).find((u) => u.id === userId)?.nombre || `Usuario #${userId}`;
  };

  // Mediación de este conflicto (si ya fue asignada): preferimos la activa
  const delConflicto = (mediaciones.data || []).filter((m) => m.conflictoId === Number(id));
  const mediacion = delConflicto.find((m) => m.activo) || delConflicto[delConflicto.length - 1];

  // ── Permisos de interfaz (el backend vuelve a validarlos) ──
  const esAdmin = user.rol === ROLES.ADMIN;
  const estaAbierto = c && c.activo !== false && getEstadoCodigo(c) === ESTADOS.ABIERTO;
  const puedeEditar = c && (c.demandanteId === user.id || esAdmin) && estaAbierto;
  const puedeAsignar = esAdmin && estaAbierto;

  const cancelar = async () => {
    if (!window.confirm('¿Cancelar este conflicto? Esta acción no se puede deshacer.')) return;
    try {
      await conflictosApi.cancelar(id);       // DELETE /api/conflictos/{id}
      navigate('/conflictos');
    } catch (e) {
      setErrorAccion(getErrorMessage(e));
    }
  };

  const recargar = () => { conflicto.reload(); mediaciones.reload(); };

  return (
    <Async loading={conflicto.loading} error={conflicto.error} onRetry={conflicto.reload}>
      {c && (
        <>
          <PageHeader titulo={`Conflicto #${c.id}`} subtitulo={c.asunto}>
            {puedeEditar && <Link to={`/conflictos/${c.id}/editar`} className="btn-secondary">Editar</Link>}
            {puedeEditar && <button onClick={cancelar} className="btn-danger">Cancelar conflicto</button>}
          </PageHeader>

          <div className="space-y-6">
            <Alert>{errorAccion}</Alert>

            <section className="card">
              <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Dato label="Estado"><EstadoBadge item={c} /></Dato>
                <Dato label="Tipo">{c.tipoConflictoNombre}</Dato>
                <Dato label="Monto reclamado">{formatMonto(c.montoReclamado)}</Dato>
                <Dato label="Demandante">{nombreDe(c.demandanteId)}</Dato>
                <Dato label="Demandado">{nombreDe(c.demandadoId)}</Dato>
                <Dato label="Mediador">{c.mediadorNombre}</Dato>
                <Dato label="Fecha de inicio">{formatFecha(c.fechaInicio)}</Dato>
                <Dato label="Fecha de cierre">{c.fechaCierre && formatFecha(c.fechaCierre)}</Dato>
                <Dato label="Resultado">{c.resultado}</Dato>
              </dl>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <Dato label="Descripción">{c.descripcion}</Dato>
              </div>
            </section>

            {mediacion && (
              <section className="card flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Mediación #{mediacion.id}</h2>
                  <p className="text-sm text-slate-500">
                    {mediacion.mediadorNombre} · {formatFecha(mediacion.fechaProgramada)}
                  </p>
                </div>
                <Link to={`/mediaciones/${mediacion.id}`} className="btn-primary">Ver mediación y sesiones</Link>
              </section>
            )}

            {puedeAsignar && (
              <section className="card">
                <h2 className="mb-1 font-semibold">Asignar mediador</h2>
                <p className="mb-4 text-sm text-slate-500">
                  Al asignarlo, el conflicto pasa a «En mediación» y se notifica a ambas partes.
                </p>
                <MediacionAdminForm conflictoId={c.id} onSaved={recargar} />
              </section>
            )}
          </div>
        </>
      )}
    </Async>
  );
}
