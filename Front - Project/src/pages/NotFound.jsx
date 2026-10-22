import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl font-bold text-slate-300">404</p>
      <h1 className="mt-3 text-xl font-semibold">Página no encontrada</h1>
      <Link to="/dashboard" className="btn-primary mt-6">Volver al inicio</Link>
    </div>
  );
}
