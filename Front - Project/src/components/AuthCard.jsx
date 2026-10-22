// Contenedor centrado compartido por Login y Registro.
export default function AuthCard({ titulo, subtitulo, children, pie }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="card w-full max-w-md">
        <div className="mb-6 text-center">
          <img src="/logo.svg" alt="ConciliaYa" className="mx-auto mb-3 h-12 w-12" />
          <h1 className="text-2xl font-bold">{titulo}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitulo}</p>
        </div>
        {children}
        <p className="mt-6 text-center text-sm text-slate-500">{pie}</p>
      </div>
    </div>
  );
}
