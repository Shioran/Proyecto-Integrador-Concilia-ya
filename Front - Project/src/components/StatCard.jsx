export default function StatCard({ titulo, valor, color = 'text-indigo-600' }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{titulo}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{valor}</p>
    </div>
  );
}
