import { httpClient } from "./httpClient.js";

export const usuarioService = {
  async listar(options = {}) {
    const respuesta = await httpClient.get("/usuarios", options);
    return respuesta?.data ?? [];
  },

  async crear(dto, options = {}) {
    const respuesta = await httpClient.post("/usuarios", dto, options);
    return respuesta?.data;
  },

  async actualizar(id, dto, options = {}) {
    const respuesta = await httpClient.put(`/usuarios/${id}`, dto, options);
    return respuesta?.data;
  },

  async cambiarEstado(id, activo, options = {}) {
    const respuesta = await httpClient.patch(`/usuarios/${id}/estado`, { activo }, options);
    return respuesta?.data;
  },

  async eliminar(id, options = {}) {
    const respuesta = await httpClient.delete(`/usuarios/${id}`, options);
    return respuesta;
  }
};
