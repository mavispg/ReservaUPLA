import { httpClient } from "./httpClient.js";

export const dashboardService = {
  async obtener(options = {}) {
    const respuesta = await httpClient.get("/dashboard", options);
    return respuesta?.data;
  }
};
