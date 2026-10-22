// Mensaje de feedback: type = 'error' | 'success' | 'info'
const ESTILOS = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

export default function Alert({ type = 'error', children }) {
  if (!children) return null;
  return (
    <div role="alert" className={`rounded-lg border px-4 py-3 text-sm ${ESTILOS[type]}`}>
      {children}
    </div>
  );
}
