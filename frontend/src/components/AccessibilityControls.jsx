import { useAccessibility } from "../context/AccessibilityContext.jsx";

export default function AccessibilityControls() {
  const {
    textoAmpliado,
    altoContraste,
    actualizarPreferencia,
    restablecerPreferencias
  } = useAccessibility();

  return (
    <details className="group relative">
      <summary
        aria-label="Ajustes de vista"
        className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 [&::-webkit-details-marker]:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-brand-700 dark:text-brand-300"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="7.5" r="1.25" fill="currentColor" stroke="none" />
          <path d="m6.5 10 5.5 2 5.5-2M12 12v4m0 0-3 4m3-4 3 4" />
        </svg>
        <span className="hidden sm:inline">Ajustes de vista</span>
      </summary>

      <div className="absolute right-0 z-40 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Ajustes de vista
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          Elige cómo quieres ver el contenido. Se guarda en este dispositivo.
        </p>

        <fieldset className="mt-4">
          <legend className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tamaño del texto
          </legend>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={!textoAmpliado}
              onClick={() => actualizarPreferencia("textoAmpliado", false)}
              className={`rounded-lg border px-3 py-2 text-sm transition focus-visible:outline-none ${
                !textoAmpliado
                  ? "border-brand-700 bg-brand-700 font-semibold text-white shadow-sm dark:border-brand-500 dark:bg-brand-600"
                  : "border-slate-300 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              Estándar
            </button>
            <button
              type="button"
              aria-pressed={textoAmpliado}
              onClick={() => actualizarPreferencia("textoAmpliado", true)}
              className={`rounded-lg border px-3 py-2 text-base transition focus-visible:outline-none ${
                textoAmpliado
                  ? "border-brand-700 bg-brand-700 font-semibold text-white shadow-sm dark:border-brand-500 dark:bg-brand-600"
                  : "border-slate-300 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              Grande
            </button>
          </div>
        </fieldset>

        <button
          type="button"
          aria-pressed={altoContraste}
          onClick={() =>
            actualizarPreferencia("altoContraste", !altoContraste)
          }
          className={`mt-3 flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition focus-visible:outline-none ${
            altoContraste
              ? "border-brand-700 bg-brand-700 font-semibold text-white shadow-sm dark:border-brand-500 dark:bg-brand-600"
              : "border-slate-300 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          }`}
        >
          <span>Alto contraste</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              altoContraste
                ? "bg-white/15 text-white"
                : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
            }`}
          >
            {altoContraste ? "Activado" : "Desactivado"}
          </span>
        </button>

        <button
          type="button"
          onClick={restablecerPreferencias}
          className="mt-3 text-xs font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-900 focus-visible:outline-none dark:text-brand-300 dark:hover:text-brand-100"
        >
          Restablecer ajustes
        </button>
      </div>
    </details>
  );
}
