/**
 * Estados de reserva centralizados para evitar "magic strings" en toda la app.
 * Los mismos valores usa el backend.
 */
export const ESTADOS_RESERVA = Object.freeze({
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  CANCELADA: "Cancelada"
});

export const ESTADOS_RESERVA_LISTA = Object.freeze(
  Object.values(ESTADOS_RESERVA)
);

export const ESTADOS_RESERVA_OPCIONES = ESTADOS_RESERVA_LISTA.map((estado) => ({
  value: estado,
  label: estado
}));
