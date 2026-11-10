import { ESTADOS_RESERVA } from "../constants/estados.js";

const ESTILOS = {
  [ESTADOS_RESERVA.PENDIENTE]: {
    caja: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/50 dark:text-amber-300",
    punto: "bg-amber-500"
  },
  [ESTADOS_RESERVA.APROBADA]: {
    caja: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-950/50 dark:text-emerald-300",
    punto: "bg-emerald-500"
  },
  [ESTADOS_RESERVA.RECHAZADA]: {
    caja: "border-red-200 bg-red-50 text-red-800 dark:border-red-700/60 dark:bg-red-950/50 dark:text-red-300",
    punto: "bg-red-500"
  },
  [ESTADOS_RESERVA.CANCELADA]: {
    caja: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    punto: "bg-slate-400"
  }
};

const NEUTRO = {
  caja: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
  punto: "bg-slate-400"
};

/**
 * Badge de estado: color + texto, nunca solo color (accesibilidad).
 * Los colores son fijos: Pendiente=amarillo, Aprobada=verde,
 * Rechazada=rojo, Cancelada=gris.
 */
export default function EstadoBadge({ estado, className = "" }) {
  const estilo = ESTILOS[estado] ?? NEUTRO;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${estilo.caja} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${estilo.punto}`}
      />
      {estado || "Sin estado"}
    </span>
  );
}
