import { Link } from 'react-router-dom';

export default function Forbidden() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl font-bold text-slate-300">403</p>
      <h1 className="mt-3 text-xl font-semibold">No tienes permiso para ver esta pantalla</h1>
      <Link to="/dashboard" className="btn-primary mt-6">Volver al inicio</Link>
    </div>
  );
}
