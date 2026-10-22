// Ventana modal simple. El estado "abierta/cerrada" lo controla el padre.
export default function Modal({ titulo, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      {/* stopPropagation: un clic dentro de la ventana no debe cerrarla */}
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Cerrar">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
