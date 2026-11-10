/**
 * Estados y tipos de ambiente. Se usan en el formulario y en la tabla.
 */
export const ESTADOS_AMBIENTE = Object.freeze({
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  MANTENIMIENTO: "Mantenimiento"
});

export const TIPOS_AMBIENTE = Object.freeze([
  "Laboratorio de cómputo",
  "Laboratorio especializado",
  "Auditorio",
  "Sala de reuniones",
  "Aula"
]);

export const TIPOS_AMBIENTE_OPCIONES = TIPOS_AMBIENTE.map((tipo) => ({
  value: tipo,
  label: tipo
}));

export const ESTADOS_AMBIENTE_OPCIONES = [
  { value: ESTADOS_AMBIENTE.ACTIVO, label: "Activo (Disponible para reservas)" },
  { value: ESTADOS_AMBIENTE.MANTENIMIENTO, label: "Mantenimiento (No disponible temporalmente)" },
  { value: ESTADOS_AMBIENTE.INACTIVO, label: "Inactivo (Fuera de servicio)" }
];
