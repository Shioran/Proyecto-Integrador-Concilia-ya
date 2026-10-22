import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { tiposConflictoApi } from '../../api/catalogosApi.js';
import { requerido, maximo, validar } from '../../utils/validators.js';
import { getErrorMessage, getFieldErrors } from '../../utils/errors.js';
import PageHeader from '../../components/PageHeader.jsx';
import Async from '../../components/Async.jsx';
import Alert from '../../components/Alert.jsx';
import Modal from '../../components/Modal.jsx';
import FormField from '../../components/FormField.jsx';

// CRUD completo de "Tipos de conflicto" (solo ADMIN):
//   Create → POST · Read → GET · Update → PUT · Delete → DELETE (baja lógica: activo=false)
export default function TiposConflicto() {
  const { data, loading, error, reload } = useFetch(tiposConflictoApi.listar);
  // `editando`: null = modal cerrado · {} = creando · {id,...} = editando ese tipo
  const [editando, setEditando] = useState(null);
  const [errorAccion, setErrorAccion] = useState('');

  const desactivar = async (tipo) => {
    if (!window.confirm(`¿Dar de baja el tipo «${tipo.nombre}»?`)) return;
    try { await tiposConflictoApi.desactivar(tipo.id); reload(); }
    catch (e) { setErrorAccion(getErrorMessage(e)); }
  };

  return (
    <>
      <PageHeader titulo="Tipos de conflicto" subtitulo="Catálogo que usan los usuarios al radicar un conflicto">
        <button className="btn-primary" onClick={() => setEditando({})}>+ Nuevo tipo</button>
      </PageHeader>

      <div className="card">
        <Alert>{errorAccion}</Alert>
        <Async loading={loading} error={error} onRetry={reload}>
          <table className="min-w-full divide-y divide-slate-200">
            <thead><tr><th className="th">#</th><th className="th">Nombre</th><th className="th">Descripción</th><th className="th">Estado</th><th className="th" /></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(data || []).map((t) => (
                <tr key={t.id}>
                  <td className="td">{t.id}</td>
                  <td className="td font-medium text-slate-900">{t.nombre}</td>
                  <td className="td">{t.descripcion || '—'}</td>
                  <td className="td">{t.activo === false ? 'Inactivo' : 'Activo'}</td>
                  <td className="td space-x-3 text-right">
                    <button className="text-indigo-600 hover:underline" onClick={() => setEditando(t)}>Editar</button>
                    {t.activo !== false && <button className="text-red-600 hover:underline" onClick={() => desactivar(t)}>Dar de baja</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Async>
      </div>

      {editando && (
        <Modal titulo={editando.id ? 'Editar tipo' : 'Nuevo tipo'} onClose={() => setEditando(null)}>
          <TipoForm tipo={editando} onSaved={() => { setEditando(null); reload(); }} />
        </Modal>
      )}
    </>
  );
}

function TipoForm({ tipo, onSaved }) {
  const esEdicion = Boolean(tipo.id);
  const [errorServidor, setErrorServidor] = useState('');
  const { values, campo, validarTodo, setErrors } = useForm(
    { nombre: tipo.nombre ?? '', descripcion: tipo.descripcion ?? '' },
    { nombre: validar(requerido('Escribe el nombre'), maximo(100)), descripcion: maximo(300) }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarTodo()) return;
    try {
      if (esEdicion) await tiposConflictoApi.actualizar(tipo.id, { ...values, activo: true });
      else await tiposConflictoApi.crear(values);
      onSaved();
    } catch (error) {
      setErrors(getFieldErrors(error));
      setErrorServidor(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Alert>{errorServidor}</Alert>
      <FormField label="Nombre" {...campo('nombre')} />
      <FormField as="textarea" rows={3} label="Descripción (opcional)" {...campo('descripcion')} />
      <button type="submit" className="btn-primary">{esEdicion ? 'Guardar cambios' : 'Crear tipo'}</button>
    </form>
  );
}
