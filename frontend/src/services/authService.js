import { httpClient } from "./httpClient.js";

export const authService = {
  /**
   * Inicia sesión con correo y contraseña reales.
   * Devuelve { token, usuario }.
   */
  async login(credenciales) {
    const respuesta = await httpClient.post("/auth/login", credenciales);
    return respuesta.data;
  },

  /**
   * Obtiene el perfil del usuario autenticado actual desde el token.
   */
  async perfil() {
    const respuesta = await httpClient.get("/auth/perfil");
    return respuesta.data;
  }
};
