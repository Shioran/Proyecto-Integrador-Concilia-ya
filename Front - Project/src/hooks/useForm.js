import { useState } from 'react';

// ─────────────────────────────────────────────────────────────
// useForm: pequeño hook para manejar formularios CONTROLADOS.
//
// Idea central de un componente controlado: el valor del <input> NO vive en el DOM,
// vive en el estado de React.   <input value={values.x} onChange={handleChange} />
//   1. El usuario teclea  → se dispara onChange
//   2. handleChange actualiza el estado `values`
//   3. React vuelve a renderizar y el input muestra el nuevo valor
// Así React es la "única fuente de verdad" y podemos validar, limpiar o precargar.
//
// `reglas` es un objeto { campo: validador } (ver utils/validators.js).
// ─────────────────────────────────────────────────────────────
export function useForm(valoresIniciales, reglas = {}) {
  const [values, setValues] = useState(valoresIniciales); // lo que el usuario escribe
  const [errors, setErrors] = useState({});               // { campo: 'mensaje' }

  const validarCampo = (name, value, todos) => reglas[name]?.(value, todos) || '';

  // Se ejecuta en cada pulsación de tecla
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const nuevoValor = type === 'checkbox' ? checked : value;
    const nuevos = { ...values, [name]: nuevoValor };
    setValues(nuevos);
    // Si el campo ya mostraba un error, lo revalidamos para que desaparezca al corregirlo
    if (errors[name]) setErrors({ ...errors, [name]: validarCampo(name, nuevoValor, nuevos) });
  };

  // Se ejecuta al salir del campo (blur): validación "perezosa", no molesta mientras se escribe
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors({ ...errors, [name]: validarCampo(name, value, values) });
  };

  // Valida TODOS los campos (se llama al enviar). Devuelve true si el formulario es válido.
  const validarTodo = () => {
    const nuevos = {};
    Object.keys(reglas).forEach((name) => {
      nuevos[name] = validarCampo(name, values[name], values);
    });
    setErrors(nuevos);
    return Object.values(nuevos).every((msg) => !msg);
  };

  // Props que cada campo necesita; se usan así: <FormField {...campo('correo')} />
  const campo = (name) => ({
    name,
    value: values[name] ?? '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: errors[name],
  });

  const reset = (nuevos = valoresIniciales) => { setValues(nuevos); setErrors({}); };

  return { values, errors, setErrors, setValues, handleChange, campo, validarTodo, reset };
}
