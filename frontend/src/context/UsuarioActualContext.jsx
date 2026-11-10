import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, eliminarToken, guardarToken, obtenerToken } from "../services/httpClient.js";
import { authService } from "../services/authService.js";
import { usuarioService } from "../services/usuarioService.js";
import { ROLES } from "../constants/roles.js";
import { UsuarioActualContext } from "./usuarioActualContext.js";

const CLAVE_USUARIO = "reservaupla.usuario";

function guardarUsuarioLocal(usuario) {
  try {
    sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
  } catch {
    // sessionStorage bloqueado
  }
}

function leerUsuarioLocal() {
  try {
    const raw = sessionStorage.getItem(CLAVE_USUARIO);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function borrarUsuarioLocal() {
  try {
    sessionStorage.removeItem(CLAVE_USUARIO);
  } catch {
    // sessionStorage bloqueado
  }
}

/**
 * Proveedor de contexto con autenticación criptográfica JWT real.
 */
export function UsuarioActualProvider({ children }) {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(() => leerUsuarioLocal());
  const [cargando, setCargando] = useState(true);
  const [cerrando, setCerrando] = useState(false);
  const [error, setError] = useState("");

  // Carga o verifica la sesión a partir del token JWT almacenado
  const inicializarSesion = useCallback(async () => {
    const token = obtenerToken();

    if (!token) {
      setUsuarioActual(null);
      borrarUsuarioLocal();
      setCargando(false);
      return;
    }

    try {
      // Valida el token contra el backend mediante GET /api/auth/perfil
      const perfil = await authService.perfil();
      setUsuarioActual(perfil);
      guardarUsuarioLocal(perfil);
      setError("");
    } catch (err) {
      // Token expirado o revocado
      eliminarToken();
      borrarUsuarioLocal();
      setUsuarioActual(null);
    } finally {
      setCargando(false);
    }
  }, []);

  // Carga el catálogo de usuarios activos para selects y gestión
  const cargarCatalogoUsuarios = useCallback(async () => {
    try {
      const lista = await usuarioService.listar();
      setUsuarios(lista);
    } catch {
      // Si aún no está autenticado, la lista puede fallar o estar restringida
      setUsuarios([]);
    }
  }, []);

  useEffect(() => {
    inicializarSesion();
  }, [inicializarSesion]);

  useEffect(() => {
    if (usuarioActual) {
      cargarCatalogoUsuarios();
    }
  }, [usuarioActual, cargarCatalogoUsuarios]);

  // Escucha evento global de sesión expirada (401)
  useEffect(() => {
    const manejarDesautenticado = () => {
      setUsuarioActual(null);
      borrarUsuarioLocal();
      eliminarToken();
    };

    window.addEventListener("reservaupla:desautenticado", manejarDesautenticado);
    return () => {
      window.removeEventListener("reservaupla:desautenticado", manejarDesautenticado);
    };
  }, []);

  /**
   * Inicio de sesión real con credenciales institucionales.
   * Valida hash con BCrypt en backend y recibe token JWT.
   */
  const iniciarSesion = useCallback(async (correo, password) => {
    setCerrando(false);
    setError("");

    const resultado = await authService.login({ correo, password });
    guardarToken(resultado.token);
    guardarUsuarioLocal(resultado.usuario);
    setUsuarioActual(resultado.usuario);

    // Carga catálogo de usuarios en segundo plano
    cargarCatalogoUsuarios();

    return resultado.usuario;
  }, [cargarCatalogoUsuarios]);

  /**
   * Cierre de sesión real: revoca el token local y limpia la memoria.
   */
  const cerrarSesion = useCallback(() => {
    setCerrando(true);
    eliminarToken();
    borrarUsuarioLocal();
    setUsuarioActual(null);
  }, []);

  const usuariosActivos = useMemo(
    () => usuarios.filter((u) => u.activo),
    [usuarios]
  );

  const value = useMemo(
    () => ({
      usuarios,
      usuariosActivos,
      usuarioActual,
      cargando,
      cerrando,
      error,
      estaAutenticado: Boolean(usuarioActual),
      iniciarSesion,
      cerrarSesion,
      recargarUsuarios: cargarCatalogoUsuarios,
      esAdministrador: usuarioActual?.rol === ROLES.ADMINISTRADOR,
      rolActual: usuarioActual?.rol ?? null
    }),
    [
      usuarios,
      usuariosActivos,
      usuarioActual,
      cargando,
      cerrando,
      error,
      iniciarSesion,
      cerrarSesion,
      cargarCatalogoUsuarios
    ]
  );

  return (
    <UsuarioActualContext.Provider value={value}>
      {children}
    </UsuarioActualContext.Provider>
  );
}
