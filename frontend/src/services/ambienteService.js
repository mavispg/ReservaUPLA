import { httpClient } from "./httpClient.js";

export const ambienteService = {
  async listar(options = {}) {
    const respuesta = await httpClient.get("/ambientes", options);
    return respuesta?.data ?? [];
  },

  async crear(dto, options = {}) {
    const respuesta = await httpClient.post("/ambientes", dto, options);
    return respuesta?.data;
  },

  async actualizar(id, dto, options = {}) {
    const respuesta = await httpClient.put(`/ambientes/${id}`, dto, options);
    return respuesta?.data;
  },

  async cambiarEstado(id, estado, options = {}) {
    const respuesta = await httpClient.patch(`/ambientes/${id}/estado`, { estado }, options);
    return respuesta?.data;
  },

  async eliminar(id, options = {}) {
    const respuesta = await httpClient.delete(`/ambientes/${id}`, options);
    return respuesta;
  }
};
