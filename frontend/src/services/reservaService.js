import { httpClient } from "./httpClient.js";

function construirQuery({ estado, ambienteId, fecha } = {}) {
  const params = new URLSearchParams();

  // "Todos" es una opción visual: no se envía como filtro.
  if (estado && estado !== "Todos") params.set("estado", estado);
  if (ambienteId) params.set("ambienteId", ambienteId);
  if (fecha) params.set("fecha", fecha);

  const query = params.toString();
  return query ? `?${query}` : "";
}

export const reservaService = {
  async listar(filtros = {}, options = {}) {
    const respuesta = await httpClient.get(
      `/reservas${construirQuery(filtros)}`,
      options
    );
    return respuesta?.data ?? [];
  },

  async obtenerPorId(id, options = {}) {
    const respuesta = await httpClient.get(`/reservas/${id}`, options);
    return respuesta?.data;
  },

  async crear(dto, options = {}) {
    const respuesta = await httpClient.post("/reservas", dto, options);
    return respuesta?.data;
  },

  async cambiarEstado(id, dto, options = {}) {
    const respuesta = await httpClient.patch(`/reservas/${id}/estado`, dto, options);
    return respuesta?.data;
  }
};
