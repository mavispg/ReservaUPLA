/**
 * Limpia espacios al inicio/fin y colapsa espacios internos.
 * Se usa antes de enviar datos al backend (que también normaliza).
 */
export function normalizeText(value = "") {
  return String(value).trim().replace(/\s+/g, " ");
}

/** Correos siempre en minúsculas y sin espacios. */
export function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}
