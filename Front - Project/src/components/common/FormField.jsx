// Campo de formulario CONTROLADO y reutilizable: etiqueta + control + mensaje de error.
// Recibe value/onChange del padre (normalmente desde useForm → {...campo('nombre')}).
// as: 'input' (por defecto) | 'textarea' | 'select' (los <option> llegan como children)
export default function FormField({ label, name, error, as = 'input', children, hint, ...props }) {
  const Control = as;
  const clases = `input ${error ? 'input-error' : ''}`;
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <Control id={name} name={name} className={clases} aria-invalid={!!error} {...props}>
        {children}
      </Control>
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
