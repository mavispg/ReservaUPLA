/**
 * Utilidades de formato para fechas y horas del backend.
 * DateOnly llega como "2026-11-20" y TimeOnly como "10:00:00".
 */
export function formatDate(value) {
  if (!value) return "—";

  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

export function formatTime(value) {
  if (!value) return "—";
  return String(value).slice(0, 5);
}

export function formatDateTime(value) {
  if (!value) return "—";

  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return value;

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(fecha);
}

/** Fecha de hoy en formato YYYY-MM-DD, usando la zona horaria local. */
export function hoyISO() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(hoy.getDate()).padStart(2, "0")}`;
}

/**
 * El input type="time" entrega "HH:mm". El backend espera TimeOnly en
 * formato ISO ("HH:mm:ss"), así que se completan los segundos.
 */
export function normalizarHora(value) {
  if (!value) return "";
  return value.length === 5 ? `${value}:00` : value;
}
