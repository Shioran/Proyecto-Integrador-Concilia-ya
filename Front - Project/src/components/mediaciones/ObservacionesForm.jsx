import { useState } from 'react';
import { mediacionesApi } from '../../api/mediacionesApi.js';
import { getErrorMessage } from '../../utils/errors.js';
import Alert from '../common/Alert.jsx';

// MEDIADOR: edita las observaciones generales → PUT /api/mediaciones/{id}  { observaciones }
// Formulario de UN solo campo: aquí se ve el componente controlado en su forma más simple.
export default function ObservacionesForm({ mediacion, onSaved }) {
  const [texto, setTexto] = useState(mediacion.observaciones ?? '');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [enviando, setEnviando] = useState(false);

  const guardar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await mediacionesApi.actualizar(mediacion.id, { observaciones: texto });
      setMensaje({ tipo: 'success', texto: 'Observaciones guardadas.' });
      onSaved?.();
    } catch (error) {
      setMensaje({ tipo: 'error', texto: getErrorMessage(error) });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={guardar} className="space-y-3">
      <Alert type={mensaje.tipo || 'info'}>{mensaje.texto}</Alert>
      <textarea className="input" rows={3} maxLength={1000}
        value={texto} onChange={(e) => setTexto(e.target.value)}
        placeholder="Notas generales de la mediación" />
      <button type="submit" className="btn-secondary" disabled={enviando}>
        {enviando ? 'Guardando…' : 'Guardar observaciones'}
      </button>
    </form>
  );
}
