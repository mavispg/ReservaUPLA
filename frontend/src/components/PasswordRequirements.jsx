import { evaluarRequisitosPassword } from "../utils/validation.js";

export default function PasswordRequirements({ password = "" }) {
  const requisitos = evaluarRequisitosPassword(password);

  return (
    <ul
      aria-label="Requisitos de la contraseña"
      className="mt-2 grid gap-x-5 gap-y-1.5 text-xs sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-3"
    >
      {requisitos.map((requisito) => (
        <li
          key={requisito.clave}
          className={`flex items-center gap-2 ${
            requisito.cumplido
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <span
            aria-hidden="true"
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
              requisito.cumplido
                ? "bg-emerald-100 dark:bg-emerald-900/50"
                : "bg-slate-100 dark:bg-slate-700"
            }`}
          >
            {requisito.cumplido ? (
              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
                <path
                  d="m3.5 8 3 3 6-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
            )}
          </span>
          <span>
            {requisito.etiqueta}
            <span className="sr-only">
              {requisito.cumplido ? " (Cumplido)" : " (Pendiente)"}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
