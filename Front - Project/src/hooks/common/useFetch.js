import { useState, useEffect, useCallback } from 'react';
import { getErrorMessage } from '../../utils/errors.js';

// ─────────────────────────────────────────────────────────────
// useFetch: carga datos desde la capa src/api/* y expone 3 estados de pantalla:
//   loading → mostrar spinner · error → mostrar alerta · data → pintar la información.
// `reload()` vuelve a pedir los datos (se usa después de crear/editar algo).
// `deps` son las dependencias que, al cambiar, disparan una nueva carga (ej. el id de la URL).
// ─────────────────────────────────────────────────────────────
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await fetcher());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
}
