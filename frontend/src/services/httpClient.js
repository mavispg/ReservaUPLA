import { API_URL } from "../config/api.js";

const CLAVE_TOKEN = "reservaupla.token";

export function obtenerToken() {
  try {
    return sessionStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
}

export function guardarToken(token) {
  try {
    sessionStorage.setItem(CLAVE_TOKEN, token);
  } catch {
    // sessionStorage bloqueado
  }
}

export function eliminarToken() {
  try {
    sessionStorage.removeItem(CLAVE_TOKEN);
  } catch {
    // sessionStorage bloqueado
  }
}

/**
 * Error uniforme de la API. Conserva el mensaje del backend y los errores
 * por campo, para que los formularios puedan mostrarlos junto a cada input.
 */
export class ApiError extends Error {
  constructor(message, status = 0, errors = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function request(path, { method = "GET", body, signal } = {}) {
  try {
    const headers = {};

    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const token = obtenerToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      // Si la sesión expiró o es inválida, se limpia el token (pero no durante el login fallido)
      if (response.status === 401 && !path.includes("/auth/login")) {
        eliminarToken();
        window.dispatchEvent(new CustomEvent("reservaupla:desautenticado"));
      }

      throw new ApiError(
        payload?.message || "No se pudo completar la operación.",
        response.status,
        payload?.errors ?? null
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === "AbortError") throw error;

    // S9: el usuario ve un mensaje entendible; el detalle queda en la consola/API.
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica que la API esté activa.",
      0
    );
  }
}

export const httpClient = {
  get: (path, options = {}) => request(path, { ...options, method: "GET" }),
  post: (path, body, options = {}) => request(path, { ...options, method: "POST", body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: "PATCH", body })
};
