import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuth.js';
import { useForm } from '../../hooks/common/useForm.js';
import { requerido, correoValido, validar } from '../../utils/validators.js';
import { getErrorMessage } from '../../utils/errors.js';
import AuthCard from '../../components/auth/AuthCard.jsx';
import FormField from '../../components/common/FormField.jsx';
import Alert from '../../components/common/Alert.jsx';

// FLUJO DE DATOS DEL LOGIN
//   <input> ──onChange──▶ useForm (estado) ──submit──▶ AuthContext.login()
//   ──▶ authApi.login() ──▶ POST /api/auth/login ──▶ { token, ...usuario }
//   ──▶ se guarda en sessionStorage + estado global `user` ──▶ navigate()
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mensaje que pudo dejar la pantalla de registro ("Cuenta creada…")
  const mensajeRegistro = location.state?.registroOk;
  // Si el usuario fue enviado al login por una ruta protegida, volvemos allí después
  const destino = location.state?.from?.pathname || '/dashboard';

  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);

  const { values, campo, validarTodo } = useForm(
    { correo: '', password: '' },
    {
      correo: validar(requerido('Ingresa tu correo'), correoValido()),
      password: requerido('Ingresa tu contraseña'),
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();              // evita que el navegador recargue la página
    setErrorServidor('');
    if (!validarTodo()) return;      // 1) validación en el cliente

    setEnviando(true);
    try {
      await login(values.correo, values.password); // 2) petición al backend
      navigate(destino, { replace: true });        // 3) a la pantalla privada
    } catch (error) {
      // 401 → el backend devuelve un mensaje genérico a propósito (no revela si el correo existe)
      setErrorServidor(getErrorMessage(error));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthCard
      titulo="Iniciar sesión"
      subtitulo="Accede a tu cuenta de ConciliaYa"
      pie={<>¿No tienes cuenta? <Link to="/register" className="font-medium text-indigo-600">Regístrate</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Alert type="success">{mensajeRegistro}</Alert>
        <Alert>{errorServidor}</Alert>

        <FormField label="Correo electrónico" type="email" autoComplete="email"
          placeholder="tucorreo@ejemplo.com" {...campo('correo')} />
        <FormField label="Contraseña" type="password" autoComplete="current-password"
          {...campo('password')} />

        <button type="submit" className="btn-primary w-full" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </AuthCard>
  );
}
