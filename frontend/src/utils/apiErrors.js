/**
 * Traduce los errores del backend ({ errors: { Campo: ["mensaje"] } }) a las
 * claves que usan los formularios. Solo se toma el primer mensaje por campo.
 */
export function extraerErroresCampo(error, mapa) {
  const resultado = {};
  const errores = error?.errors;

  if (!errores) return resultado;

  Object.entries(mapa).forEach(([campoFormulario, campoBackend]) => {
    const objetivo = campoBackend.toLowerCase();

    // El backend puede devolver "HoraInicio", "$.horaInicio" o "horaInicio".
    const clave = Object.keys(errores).find((nombre) => {
      const limpia = nombre.replace(/^\$\./, "").toLowerCase();
      return limpia === objetivo;
    });

    if (!clave) return;

    const mensajes = errores[clave];

    if (Array.isArray(mensajes) && mensajes.length > 0) {
      resultado[campoFormulario] = mensajes[0];
    }
  });

  return resultado;
}

export function obtenerMensajeError(
  error,
  porDefecto = "Ocurrió un error inesperado. Intenta nuevamente."
) {
  return error?.message || porDefecto;
}
