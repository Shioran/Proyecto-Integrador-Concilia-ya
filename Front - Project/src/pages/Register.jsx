import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useForm } from '../hooks/useForm.js';
import { requerido, correoValido, minimo, igualA, validar } from '../utils/validators.js';
import { getErrorMessage, getFieldErrors } from '../utils/errors.js';
import AuthCard from '../components/AuthCard.jsx';
import FormField from '../components/FormField.jsx';
import Alert from '../components/Alert.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);

  const { values, campo, validarTodo, setErrors } = useForm(
    { nombre: '', apellido: '', correo: '', password: '', confirmar: '' },
    {
      nombre: requerido('Ingresa tu nombre'),
      apellido: requerido('Ingresa tu apellido'),
      correo: validar(requerido('Ingresa tu correo'), correoValido()),
      password: validar(requerido('Crea una contraseña'), minimo(8)),
      // igualA compara contra OTRO campo del formulario (validación cruzada)
      confirmar: validar(requerido('Repite la contraseña'), igualA('password', 'Las contraseñas no coinciden')),
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServidor('');
    if (!validarTodo()) return;

    setEnviando(true);
    try {
      // Solo enviamos lo que pide el backend (NO "confirmar", que es solo de la interfaz)
      const { nombre, apellido, correo, password } = values;
      await register({ nombre, apellido, correo, password });
      navigate('/login', { state: { registroOk: 'Cuenta creada. Ya puedes iniciar sesión.' } });
    } catch (error) {
      // 400 con fieldErrors: el backend nos dice qué campo falló → lo pintamos bajo ese campo
      setErrors(getFieldErrors(error));
      setErrorServidor(getErrorMessage(error)); // 409: correo ya registrado
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthCard
      titulo="Crear cuenta"
      subtitulo="Regístrate para radicar y seguir tus conflictos"
      pie={<>¿Ya tienes cuenta? <Link to="/login" className="font-medium text-indigo-600">Inicia sesión</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Alert>{errorServidor}</Alert>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nombre" autoComplete="given-name" {...campo('nombre')} />
          <FormField label="Apellido" autoComplete="family-name" {...campo('apellido')} />
        </div>
        <FormField label="Correo electrónico" type="email" autoComplete="email" {...campo('correo')} />
        <FormField label="Contraseña" type="password" autoComplete="new-password"
          hint="Mínimo 8 caracteres" {...campo('password')} />
        <FormField label="Confirmar contraseña" type="password" autoComplete="new-password"
          {...campo('confirmar')} />
        <button type="submit" className="btn-primary w-full" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Registrarme'}
        </button>
      </form>
    </AuthCard>
  );
}
