/**
 * Tarjeta para indicador del dashboard.
 * - Usabilidad (Nielsen 8): Tipografía adaptativa. Números en tamaño grande (3xl),
 *   textos largos o "Sin datos" en tamaño proporcional para mantener el grid nivelado.
 * - Estética Institucional: Tarjetas limpias con elevación sutil e íconos en cápsula moderna.
 */

const TONOS = {
  brand: {
    tarjeta: "border-slate-200 bg-brand-50/70 border-t-brand-500 dark:border-slate-700/60 dark:border-t-brand-500 dark:bg-slate-800",
    acento: "bg-brand-600 dark:bg-brand-500",
    titulo: "text-slate-600 dark:text-brand-300",
    texto: "text-brand-800 dark:text-brand-300",
    icono: "bg-white/80 text-brand-600 ring-1 ring-brand-200/70 dark:bg-brand-950 dark:text-brand-400 dark:ring-0"
  },
  success: {
    tarjeta: "border-slate-200 bg-emerald-50/70 border-t-emerald-500 dark:border-slate-700/60 dark:border-t-emerald-500 dark:bg-slate-800",
    acento: "bg-emerald-600 dark:bg-emerald-500",
    titulo: "text-slate-600 dark:text-emerald-300",
    texto: "text-emerald-800 dark:text-emerald-300",
    icono: "bg-white/80 text-emerald-600 ring-1 ring-emerald-200/70 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-0"
  },
  warning: {
    tarjeta: "border-slate-200 bg-amber-50/70 border-t-amber-500 dark:border-slate-700/60 dark:border-t-amber-500 dark:bg-slate-800",
    acento: "bg-amber-600 dark:bg-amber-500",
    titulo: "text-slate-600 dark:text-amber-300",
    texto: "text-amber-800 dark:text-amber-300",
    icono: "bg-white/80 text-amber-600 ring-1 ring-amber-200/70 dark:bg-amber-950 dark:text-amber-400 dark:ring-0"
  },
  danger: {
    tarjeta: "border-slate-200 bg-rose-50/70 border-t-red-500 dark:border-slate-700/60 dark:border-t-red-500 dark:bg-slate-800",
    acento: "bg-red-600 dark:bg-red-500",
    titulo: "text-slate-600 dark:text-red-300",
    texto: "text-rose-800 dark:text-red-300",
    icono: "bg-white/80 text-rose-600 ring-1 ring-rose-200/70 dark:bg-red-950 dark:text-red-400 dark:ring-0"
  },
  neutral: {
    tarjeta: "border-slate-200 bg-slate-100/80 border-t-slate-500 dark:border-slate-700/60 dark:border-t-slate-500 dark:bg-slate-800",
    acento: "bg-slate-500 dark:bg-slate-500",
    titulo: "text-slate-700 dark:text-slate-300",
    texto: "text-slate-700 dark:text-slate-200",
    icono: "bg-white/80 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:ring-0"
  }
};

export default function CardIndicador({
  titulo,
  valor,
  descripcion = "",
  tono = "brand",
  icono = null,
  cargando = false,
  className = ""
}) {
  const estilo = TONOS[tono] ?? TONOS.brand;

  const esNumero =
    typeof valor === "number" ||
    (!isNaN(Number(valor)) && valor !== "" && valor !== null && valor !== undefined && !isNaN(parseInt(valor, 10)) && String(valor).trim().length <= 4);

  const esSinDatos =
    valor === "Sin datos" ||
    valor === "" ||
    valor === null ||
    valor === undefined ||
    valor === "—";

  return (
    <article
      aria-busy={cargando || undefined}
      className={`group relative overflow-hidden rounded-2xl border border-t-4 p-5 shadow-sm ring-1 ring-slate-900/[0.02] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-slate-900/[0.05] motion-reduce:transform-none dark:shadow-none dark:hover:border-slate-600 dark:hover:shadow-md ${estilo.tarjeta} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 -top-1 h-1 ${estilo.acento}`}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/35 blur-2xl transition-opacity group-hover:opacity-70 dark:bg-transparent"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className={`min-h-8 text-xs font-bold uppercase leading-4 tracking-[0.1em] ${estilo.titulo}`}>
            {titulo}
          </h3>

          {cargando ? (
            <div className="mt-2 flex min-h-12 items-center">
              <div
                aria-hidden="true"
                className="h-9 w-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
              />
            </div>
          ) : esNumero ? (
            <p
              aria-live="polite"
              className={`mt-2 flex min-h-12 items-center text-2xl font-extrabold leading-none tracking-tight sm:text-3xl ${estilo.texto}`}
            >
              {valor}
            </p>
          ) : esSinDatos ? (
            <p
              aria-live="polite"
              className="mt-2 flex min-h-12 items-center text-base font-medium italic leading-5 text-slate-400 dark:text-slate-500"
            >
              Sin datos registrados
            </p>
          ) : (
            <p
              aria-live="polite"
              title={typeof valor === "string" ? valor : undefined}
              className={`mt-2 flex min-h-12 items-center text-base font-bold leading-5 sm:text-lg ${estilo.texto}`}
            >
              {valor}
            </p>
          )}

          {descripcion && (
            <p className="mt-1.5 break-words text-sm leading-5 text-slate-600 dark:text-slate-400">
              {descripcion}
            </p>
          )}
        </div>

        {icono && (
          <span
            aria-hidden="true"
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-105 dark:shadow-none ${estilo.icono}`}
          >
            {icono}
          </span>
        )}
      </div>
    </article>
  );
}
