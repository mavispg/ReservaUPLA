const TIPOS = {
  success: {
    contenedor: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/80 dark:bg-emerald-950/60 dark:text-emerald-200",
    icono: "text-emerald-600 dark:text-emerald-400",
    role: "status",
    live: "polite",
    svg: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.5l2.5 2.5 4.5-5" />
      </>
    )
  },
  error: {
    contenedor: "border-red-200 bg-red-50 text-red-900 dark:border-red-800/80 dark:bg-red-950/60 dark:text-red-200",
    icono: "text-red-600 dark:text-red-400",
    role: "alert",
    live: "assertive",
    svg: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9l6 6M15 9l-6 6" />
      </>
    )
  },
  warning: {
    contenedor: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/80 dark:bg-amber-950/60 dark:text-amber-200",
    icono: "text-amber-600 dark:text-amber-400",
    role: "status",
    live: "polite",
    svg: (
      <>
        <path d="M12 3l9.5 17H2.5L12 3z" />
        <path d="M12 9v5M12 17.5h.01" />
      </>
    )
  },
  info: {
    contenedor: "border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-800/80 dark:bg-brand-950/60 dark:text-brand-200",
    icono: "text-brand-600 dark:text-brand-400",
    role: "status",
    live: "polite",
    svg: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    )
  }
};

/**
 * Mensaje de éxito, error, advertencia o información.
 * role="alert"/aria-live hacen que un lector de pantalla anuncie el cambio.
 */
export default function AlertMessage({
  tipo = "info",
  titulo = "",
  children,
  onClose,
  className = ""
}) {
  const estilo = TIPOS[tipo] ?? TIPOS.info;

  return (
    <div
      role={estilo.role}
      aria-live={estilo.live}
      className={`flex gap-3 rounded-xl border p-4 ${estilo.contenedor} ${className}`}
    >
      <span className={`mt-0.5 shrink-0 ${estilo.icono}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          {estilo.svg}
        </svg>
      </span>

      <div className="min-w-0 flex-1">
        {titulo && <p className="text-sm font-semibold">{titulo}</p>}
        {children && (
          <div className={`text-sm leading-relaxed ${titulo ? "mt-1" : ""}`}>
            {children}
          </div>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-md text-current opacity-80 transition hover:bg-red-100 hover:text-red-700 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:bg-red-950/50 dark:hover:text-red-300"
          aria-label="Cerrar mensaje"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}
