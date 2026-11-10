/**
 * Roles centralizados. Los mismos textos usa el backend.
 */
export const ROLES = Object.freeze({
  ADMINISTRADOR: "Administrador",
  SOLICITANTE: "Solicitante",
  RESPONSABLE_AMBIENTE: "Responsable de ambiente"
});

export const ROLES_OPCIONES = Object.values(ROLES).map((rol) => ({
  value: rol,
  label: rol
}));

export const ROLES_CREAN_RESERVA = Object.freeze([
  ROLES.SOLICITANTE,
  ROLES.ADMINISTRADOR
]);

export const ROLES_VEN_AMBIENTES = Object.freeze([
  ROLES.ADMINISTRADOR,
  ROLES.RESPONSABLE_AMBIENTE
]);
