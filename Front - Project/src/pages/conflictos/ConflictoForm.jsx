import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/common/useFetch.js';
import { useForm } from '../../hooks/common/useForm.js';
import { conflictosApi } from '../../api/conflictosApi.js';
import { tiposConflictoApi } from '../../api/catalogosApi.js';
import { usuariosApi } from '../../api/usuariosApi.js';
import { requerido, maximo, numeroNoNegativo, validar } from '../../utils/validators.js';
import { getErrorMessage, getFieldErrors } from '../../utils/errors.js';
import { getEstadoCodigo, ESTADOS } from '../../utils/estados.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import FormField from '../../components/common/FormField.jsx';
import Async from '../../components/common/Async.jsx';
import Alert from '../../components/common/Alert.jsx';

// ─────────────────────────────────────────────────────────────
// Una sola pantalla para CREAR (/conflictos/nuevo) y EDITAR (/conflictos/:id/editar).
// Estructura en 2 niveles:
//   ConflictoFormPage → carga los datos que necesita (catálogos, y el conflicto si edita)
//   ConflictoForm     → formulario controlado, ya con todo listo
// Separarlos evita inicializar el formulario con datos que aún no llegaron.
// ─────────────────────────────────────────────────────────────
export default function ConflictoFormPage() {
  const { id } = useParams();          // undefined al crear, número al editar
  const esEdicion = Boolean(id);

  const { data, loading, error, reload } = useFetch(async () => {
    // Promise.all lanza las 3 peticiones en paralelo
    const [directorio, tipos, conflicto] = await Promise.all([
      usuariosApi.directorio(),
      tiposConflictoApi.listar(),
      esEdicion ? conflictosApi.obtener(id) : Promise.resolve(null),
    ]);
    return { directorio, tipos, conflicto };
  }, [id]);

  return (
    <>
      <PageHeader titulo={esEdicion ? `Editar conflicto #${id}` : 'Nuevo conflicto'}
        subtitulo="Describe el conflicto y selecciona a la otra parte" />
      <Async loading={loading} error={error} onRetry={reload}>
        {data && <ConflictoForm {...data} id={id} />}
      </Async>
    </>
  );
}

function ConflictoForm({ directorio, tipos, conflicto, id }) {
  const navigate = useNavigate();
  const esEdicion = Boolean(conflicto);
  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Valores iniciales: vacíos al crear, precargados al editar.
  // (el conflicto trae el NOMBRE del tipo, así que buscamos su id en el catálogo)
  const inicial = {
    usuarioDemandadoId: conflicto ? String(conflicto.demandadoId) : '',
    tipoConflictoId: conflicto
      ? String(tipos.find((t) => t.nombre === conflicto.tipoConflictoNombre)?.id ?? '')
      : '',
    asunto: conflicto?.asunto ?? '',
    descripcion: conflicto?.descripcion ?? '',
    montoReclamado: conflicto?.montoReclamado ?? '',
  };

  const { values, campo, validarTodo, setErrors } = useForm(inicial, {
    usuarioDemandadoId: requerido('Selecciona a la parte demandada'),
    tipoConflictoId: requerido('Selecciona el tipo de conflicto'),
    asunto: validar(requerido('Escribe el asunto'), maximo(200)),
    descripcion: maximo(1000),
    montoReclamado: numeroNoNegativo(),
  });

  // Solo el ABIERTO se puede editar (regla de negocio del backend)
  if (esEdicion && (getEstadoCodigo(conflicto) !== ESTADOS.ABIERTO)) {
    return <Alert type="info">Este conflicto ya no está abierto, por eso no se puede editar.</Alert>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServidor('');
    if (!validarTodo()) return;

    // Los <select> e <input> entregan TEXTO; el backend espera números → convertimos.
    // Nota: NO enviamos estado ni demandante. El backend toma el demandante del token
    // y fija el estado en ABIERTO: el cliente nunca decide eso.
    const body = {
      usuarioDemandadoId: Number(values.usuarioDemandadoId),
      tipoConflictoId: Number(values.tipoConflictoId),
      asunto: values.asunto.trim(),
      descripcion: values.descripcion.trim(),
      montoReclamado: values.montoReclamado === '' ? null : Number(values.montoReclamado),
    };

    setEnviando(true);
    try {
      const guardado = esEdicion
        ? await conflictosApi.actualizar(id, body)  // PUT /api/conflictos/{id}
        : await conflictosApi.crear(body);          // POST /api/conflictos
      navigate(`/conflictos/${guardado?.id ?? id}`);
    } catch (error) {
      setErrors(getFieldErrors(error));
      setErrorServidor(getErrorMessage(error));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="card max-w-2xl space-y-4">
      <Alert>{errorServidor}</Alert>

      <FormField as="select" label="Parte demandada" {...campo('usuarioDemandadoId')}>
        <option value="">Selecciona un usuario…</option>
        {directorio.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
      </FormField>

      <FormField as="select" label="Tipo de conflicto" {...campo('tipoConflictoId')}>
        <option value="">Selecciona un tipo…</option>
        {tipos.filter((t) => t.activo !== false).map((t) => (
          <option key={t.id} value={t.id}>{t.nombre}</option>
        ))}
      </FormField>

      <FormField label="Asunto" placeholder="Resumen corto del conflicto" {...campo('asunto')} />
      <FormField as="textarea" rows={4} label="Descripción (opcional)" {...campo('descripcion')} />
      <FormField type="number" min="0" step="1000" label="Monto reclamado en COP (opcional)"
        {...campo('montoReclamado')} />

      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={enviando}>
          {enviando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Radicar conflicto'}
        </button>
        <Link to={esEdicion ? `/conflictos/${id}` : '/conflictos'} className="btn-secondary">Cancelar</Link>
      </div>
    </form>
  );
}
