import { useState } from 'react';
import { useFetch } from '../../hooks/common/useFetch.js';
import { useForm } from '../../hooks/common/useForm.js';
import { usuariosApi } from '../../api/usuariosApi.js';
import { perfilesApi } from '../../api/catalogosApi.js';
import { requerido, correoValido, minimo, validar } from '../../utils/validators.js';
import { getErrorMessage, getFieldErrors } from '../../utils/errors.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Async from '../../components/common/Async.jsx';
import Alert from '../../components/common/Alert.jsx';
import Modal from '../../components/common/Modal.jsx';
import FormField from '../../components/common/FormField.jsx';

// CRUD de usuarios (solo ADMIN). Es la forma de crear MEDIADORES:
// el registro público siempre crea perfil «Usuario».
export default function Usuarios() {
  const usuarios = useFetch(usuariosApi.listar);
  const perfiles = useFetch(perfilesApi.listar);
  const [editando, setEditando] = useState(null); // null = cerrado · {} = nuevo · {id,...} = editar
  const [errorAccion, setErrorAccion] = useState('');

  const nombrePerfil = (id) => (perfiles.data || []).find((p) => p.id === id)?.nombre ?? id;

  const desactivar = async (u) => {
    if (!window.confirm(`¿Dar de baja a ${u.nombre}?`)) return;
    try { await usuariosApi.desactivar(u.id); usuarios.reload(); }
    catch (e) { setErrorAccion(getErrorMessage(e)); }
  };

  return (
    <>
      <PageHeader titulo="Usuarios" subtitulo="Administra cuentas y perfiles">
        <button className="btn-primary" onClick={() => setEditando({})}>+ Nuevo usuario</button>
      </PageHeader>

      <div className="card">
        <Alert>{errorAccion}</Alert>
        <Async loading={usuarios.loading} error={usuarios.error} onRetry={usuarios.reload}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead><tr><th className="th">#</th><th className="th">Nombre</th><th className="th">Correo</th><th className="th">Perfil</th><th className="th">Estado</th><th className="th" /></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {(usuarios.data || []).map((u) => (
                  <tr key={u.id}>
                    <td className="td">{u.id}</td>
                    <td className="td font-medium text-slate-900">{u.nombre} {u.apellido}</td>
                    <td className="td">{u.correo}</td>
                    <td className="td">{nombrePerfil(u.perfilId)}</td>
                    <td className="td">{u.activo === false ? 'Inactivo' : 'Activo'}</td>
                    <td className="td space-x-3 text-right">
                      <button className="text-indigo-600 hover:underline" onClick={() => setEditando(u)}>Editar</button>
                      {u.activo !== false && <button className="text-red-600 hover:underline" onClick={() => desactivar(u)}>Dar de baja</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Async>
      </div>

      {editando && (
        <Modal titulo={editando.id ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setEditando(null)}>
          <UsuarioForm usuario={editando} perfiles={perfiles.data || []}
            onSaved={() => { setEditando(null); usuarios.reload(); }} />
        </Modal>
      )}
    </>
  );
}

function UsuarioForm({ usuario, perfiles, onSaved }) {
  const esEdicion = Boolean(usuario.id);
  const [errorServidor, setErrorServidor] = useState('');

  const { values, campo, validarTodo, setErrors } = useForm(
    {
      nombre: usuario.nombre ?? '',
      apellido: usuario.apellido ?? '',
      correo: usuario.correo ?? '',
      telefono: usuario.telefono ?? '',
      perfilId: String(usuario.perfilId ?? '3'),
      password: '',
    },
    {
      nombre: requerido('Escribe el nombre'),
      apellido: requerido('Escribe el apellido'),
      correo: validar(requerido('Escribe el correo'), correoValido()),
      perfilId: requerido('Selecciona un perfil'),
      // Contraseña: obligatoria al crear; al editar solo se valida si se escribe una nueva
      password: (v) => (esEdicion && !v ? '' : validar(requerido('Escribe una contraseña'), minimo(8))(v)),
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarTodo()) return;
    const body = { ...values, perfilId: Number(values.perfilId) };
    if (!body.password) delete body.password; // al editar, vacío = no cambiar la contraseña
    try {
      if (esEdicion) await usuariosApi.actualizar(usuario.id, body);
      else await usuariosApi.crear(body);
      onSaved();
    } catch (error) {
      setErrors(getFieldErrors(error));
      setErrorServidor(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Alert>{errorServidor}</Alert>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Nombre" {...campo('nombre')} />
        <FormField label="Apellido" {...campo('apellido')} />
      </div>
      <FormField type="email" label="Correo" {...campo('correo')} />
      <FormField label="Teléfono (opcional)" {...campo('telefono')} />
      <FormField as="select" label="Perfil" {...campo('perfilId')}>
        <option value="">Selecciona…</option>
        {perfiles.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
      </FormField>
      <FormField type="password" label={esEdicion ? 'Nueva contraseña (opcional)' : 'Contraseña'}
        hint="Mínimo 8 caracteres" autoComplete="new-password" {...campo('password')} />
      <button type="submit" className="btn-primary">{esEdicion ? 'Guardar cambios' : 'Crear usuario'}</button>
    </form>
  );
}
