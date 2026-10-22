import { useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { useForm } from '../hooks/useForm.js';
import { mediacionesApi } from '../api/mediacionesApi.js';
import { usuariosApi } from '../api/usuariosApi.js';
import { requerido, maximo } from '../utils/validators.js';
import { aInputFecha } from '../utils/format.js';
import { getErrorMessage, getFieldErrors } from '../utils/errors.js';
import FormField from './FormField.jsx';
import Alert from './Alert.jsx';

// Formulario del ADMIN con dos usos:
//   · ASIGNAR  (sin `mediacion`)  → POST /api/mediaciones     (conflicto ABIERTO → EN_MEDIACION)
//   · REPROGRAMAR / REASIGNAR (con `mediacion`) → PUT /api/mediaciones/{id}
export default function MediacionAdminForm({ conflictoId, mediacion, onSaved }) {
  const esEdicion = Boolean(mediacion);
  const mediadores = useFetch(usuariosApi.mediadores);
  const [errorServidor, setErrorServidor] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  const { values, campo, validarTodo, setErrors } = useForm(
    {
      mediadorId: mediacion ? String(mediacion.mediadorId) : '',
      fechaProgramada: aInputFecha(mediacion?.fechaProgramada),
      lugar: mediacion?.lugar ?? '',
    },
    {
      mediadorId: requerido('Selecciona un mediador'),
      lugar: maximo(200),
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServidor('');
    setExito('');
    if (!validarTodo()) return;

    setEnviando(true);
    try {
      if (esEdicion) {
        // PUT parcial: solo enviamos lo que realmente cambió
        const body = {};
        if (Number(values.mediadorId) !== mediacion.mediadorId) body.mediadorId = Number(values.mediadorId);
        if (values.fechaProgramada !== aInputFecha(mediacion.fechaProgramada)) body.fechaProgramada = values.fechaProgramada || null;
        if (values.lugar !== (mediacion.lugar ?? '')) body.lugar = values.lugar;
        if (Object.keys(body).length === 0) { setExito('No hay cambios por guardar.'); return; }
        await mediacionesApi.actualizar(mediacion.id, body);
        setExito('Mediación actualizada. Las partes fueron notificadas.');
      } else {
        await mediacionesApi.asignar({
          conflictoId,
          mediadorId: Number(values.mediadorId),
          fechaProgramada: values.fechaProgramada || undefined,
          lugar: values.lugar || undefined,
        });
      }
      onSaved?.();
    } catch (error) {
      setErrors(getFieldErrors(error));
      setErrorServidor(getErrorMessage(error)); // 409: ya hay mediación activa, mediador inválido, etc.
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Alert>{errorServidor || mediadores.error}</Alert>
      <Alert type="success">{exito}</Alert>

      <FormField as="select" label="Mediador" {...campo('mediadorId')}>
        <option value="">{mediadores.loading ? 'Cargando mediadores…' : 'Selecciona un mediador…'}</option>
        {(mediadores.data || []).map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField type="datetime-local" label="Fecha programada (opcional)" {...campo('fechaProgramada')} />
        <FormField label="Lugar (opcional)" placeholder="Sede o enlace de la reunión" {...campo('lugar')} />
      </div>
      <button type="submit" className="btn-primary" disabled={enviando}>
        {enviando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Asignar mediador'}
      </button>
    </form>
  );
}
