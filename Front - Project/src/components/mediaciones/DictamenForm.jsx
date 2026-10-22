import { useState } from 'react';
import { useForm } from '../../hooks/common/useForm.js';
import { mediacionesApi } from '../../api/mediacionesApi.js';
import { requerido, maximo, validar } from '../../utils/validators.js';
import { getErrorMessage, getFieldErrors } from '../../utils/errors.js';
import FormField from '../common/FormField.jsx';
import Alert from '../common/Alert.jsx';

// MEDIADOR: dictamen final → POST /api/mediaciones/{id}/dictamen  { acuerdo, detalle }
//   acuerdo = true  → conflicto RESUELTO   ·   acuerdo = false → conflicto CERRADO
export default function DictamenForm({ mediacionId, onSaved }) {
  const [errorServidor, setErrorServidor] = useState('');
  const [errorAcuerdo, setErrorAcuerdo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const { values, handleChange, campo, validarTodo, setErrors } = useForm(
    { acuerdo: '', detalle: '' },
    { detalle: validar(requerido('Escribe el detalle del dictamen'), maximo(1000)) }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServidor('');
    const detalleOk = validarTodo();
    const acuerdoOk = values.acuerdo !== '';
    setErrorAcuerdo(acuerdoOk ? '' : 'Indica si hubo acuerdo');
    if (!detalleOk || !acuerdoOk) return;

    if (!window.confirm('El dictamen cierra la mediación y no se puede modificar. ¿Continuar?')) return;

    setEnviando(true);
    try {
      await mediacionesApi.dictaminar(mediacionId, {
        acuerdo: values.acuerdo === 'true', // los radios entregan texto → lo pasamos a boolean
        detalle: values.detalle.trim(),
      });
      onSaved?.();
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

      {/* Radios controlados: `checked` se calcula desde el estado, no desde el DOM */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">Resultado</legend>
        <div className="flex flex-wrap gap-6 text-sm">
          {[['true', 'Hubo acuerdo'], ['false', 'Sin acuerdo']].map(([valor, texto]) => (
            <label key={valor} className="flex items-center gap-2">
              <input type="radio" name="acuerdo" value={valor}
                checked={values.acuerdo === valor} onChange={handleChange} />
              {texto}
            </label>
          ))}
        </div>
        {errorAcuerdo && <p className="mt-1 text-xs text-red-600">{errorAcuerdo}</p>}
      </fieldset>

      <FormField as="textarea" rows={4} label="Detalle del dictamen" {...campo('detalle')} />
      <button type="submit" className="btn-danger" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Emitir dictamen y cerrar'}
      </button>
    </form>
  );
}
