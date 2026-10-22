import Alert from './Alert.jsx';
import Loading from './Loading.jsx';

// Envuelve el contenido de una pantalla que depende de una petición (useFetch):
// muestra spinner mientras carga, un error con botón "Reintentar" o, si todo va bien, los hijos.
export default function Async({ loading, error, onRetry, children }) {
  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="space-y-3">
        <Alert>{error}</Alert>
        {onRetry && <button className="btn-secondary" onClick={onRetry}>Reintentar</button>}
      </div>
    );
  }
  return children;
}
