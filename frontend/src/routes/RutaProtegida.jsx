import { Navigate, Outlet, useLocation } from "react-router-dom";
import Spinner from "../components/Spinner.jsx";
import { useUsuarioActual } from "../context/useUsuarioActual.js";

function PantallaCargandoSesion() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-xl"
      >
        <Spinner className="h-5 w-5 text-brand-600" />
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Cargando sesión...
          </p>
          <p className="text-xs text-slate-500">
            Verificando el usuario actual.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Protege las rutas privadas. Si no hay sesión, redirige al login guardando
 * la ruta de origen para volver después de ingresar.
 *
 * Excepción de arranque: /usuarios se permite sin sesión cuando todavía no
 * existe ningún usuario, para poder crear el primer administrador.
 */
export default function RutaProtegida() {
  const {
    usuarioActual,
    cargando,
    error,
    usuariosActivos,
    cerrando
  } = useUsuarioActual();
  const location = useLocation();

  if (cargando && !usuarioActual) {
    return <PantallaCargandoSesion />;
  }

  const esBootstrap =
    !error &&
    usuariosActivos.length === 0 &&
    location.pathname === "/usuarios";

  if (!usuarioActual && !esBootstrap) {
    return (
      <Navigate
        to="/login"
        replace
        state={
          cerrando
            ? undefined
            : { from: `${location.pathname}${location.search}` }
        }
      />
    );
  }

  return <Outlet />;
}
