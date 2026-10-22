import { useState } from 'react';
import { useForm } from '../../hooks/common/useForm.js';
import { mediacionesApi } from '../../api/mediacionesApi.js';
import { requerido, maximo, validar } from '../../utils/validators.js';
import { getErrorMessage, getFieldErrors } from '../../utils/errors.js';
import FormField from '../common/FormField.jsx';
import Alert from '../common/Alert.jsx';

// MEDIADOR: registra una sesión de la mediación → POST /api/mediaciones/{id}/sesiones
export default function SesionForm({ mediacionId, onSaved }) {
  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);

  const { values, campo, validarTodo, setErrors, reset } = useForm(
    { fecha: '', lugar: '', observaciones: '' },
    {
      fecha: requerido('Indica la fecha de la sesión'),
      lugar: maximo(200),
      observaciones: validar(requerido('Describe lo ocurrido en la sesión'), maximo(1000)),
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServidor('');
    if (!validarTodo()) return;
    setEnviando(true);
    try {
      await mediacionesApi.registrarSesion(mediacionId, values);
      reset();      // limpia el formulario para registrar otra sesión
      onSaved?.();  // el padre vuelve a pedir la lista de sesiones
    } catch (error) {
      setErrors(getFieldErrors(error));
      setErrorServidor(getErrorMessage(error));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Alert>{errorServidor}</Alert>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField type="datetime-local" label="Fecha y hora" {...campo('fecha')} />
        <FormField label="Lugar (opcional)" {...campo('lugar')} />
      </div>
      <FormField as="textarea" rows={3} label="Observaciones" {...campo('observaciones')} />
      <button type="submit" className="btn-primary" disabled={enviando}>
        {enviando ? 'Registrando…' : 'Registrar sesión'}
      </button>
    </form>
  );
}
