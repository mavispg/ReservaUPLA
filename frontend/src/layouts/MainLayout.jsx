import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import {
  ROLES,
  ROLES_VEN_AMBIENTES
} from "../constants/roles.js";
import { useUsuarioActual } from "../context/useUsuarioActual.js";
import ThemeToggle from "../components/ThemeToggle.jsx";
import AccessibilityControls from "../components/AccessibilityControls.jsx";
import logoIsotipo from "../assets/logo-isotipo-upla.png";

const ENLACES = [
  {
    to: "/dashboard",
    etiqueta: "Inicio",
    roles: null,
    icono: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    )
  },
  {
    to: "/reservas",
    etiqueta: "Reservas",
    roles: null,
    icono: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </>
    )
  },
  {
    to: "/usuarios",
    etiqueta: "Usuarios",
    roles: [ROLES.ADMINISTRADOR],
    icono: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    )
  },
  {
    to: "/ambientes",
    etiqueta: "Ambientes",
    roles: ROLES_VEN_AMBIENTES,
    icono: (
      <>
        <path d="M3 21h18M5 21V7l7-4 7 4v14" />
        <path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />
      </>
    )
  }
];

function esRutaActiva(pathname, to) {
  if (to === "/reservas") {
    return (
      pathname === "/reservas" ||
      pathname.startsWith("/reservas/")
    );
  }

  return pathname === to;
}

export default function MainLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const {
    usuariosActivos,
    usuarioActual,
    cargando,
    error,
    recargarUsuarios,
    cerrarSesion
  } = useUsuarioActual();

  const enlacesVisibles = ENLACES.filter((enlace) => {
    if (!enlace.roles) return true;
    return usuarioActual && enlace.roles.includes(usuarioActual.rol);
  });

  const cerrarMenu = () => setMenuAbierto(false);

  const manejarSalir = () => {
    cerrarSesion();
    cerrarMenu();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>

      {menuAbierto && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={cerrarMenu}
          aria-hidden="true"
        />
      )}

      <aside
        id="menu-principal"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#0b1f38] border-r border-[#122e54] shadow-2xl transition-transform duration-200 lg:translate-x-0 ${
          menuAbierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          to="/dashboard"
          onClick={cerrarMenu}
          className="flex items-center gap-3.5 border-b border-[#14325a] px-6 py-5 transition hover:bg-white/5"
        >
          <img
            src={logoIsotipo}
            alt="Isotipo UPLA"
            className="h-10 w-10 shrink-0 object-contain drop-shadow-md"
          />
          <div className="min-w-0">
            <span className="block text-base font-bold tracking-tight text-white leading-tight">
              ReservaUPLA
            </span>
            <span className="block truncate text-xs font-medium text-brand-300 mt-0.5">
              Universidad Peruana Los Andes
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={cerrarMenu}
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Cerrar menú"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <nav
          aria-label="Navegación principal"
          className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5"
        >
          {enlacesVisibles.map((enlace) => {
            const activo = esRutaActiva(pathname, enlace.to);

            return (
              <Link
                key={enlace.to}
                to={enlace.to}
                onClick={cerrarMenu}
                aria-current={activo ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                  activo
                    ? "bg-brand-600 text-white shadow-md shadow-brand-900/40 ring-1 ring-white/15"
                    : "text-slate-300 hover:bg-white/8 hover:text-white"
                }`}
              >
                <span
                  className={`shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                    activo ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    {enlace.icono}
                  </svg>
                </span>
                {enlace.etiqueta}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#14325a] px-6 py-4">
          <p className="text-xs font-semibold text-slate-200">
            Universidad Peruana Los Andes
          </p>
          <p className="mt-0.5 text-xs leading-5 text-slate-300">
            ReservaUPLA · Campus Universitario
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-900/95 transition-colors duration-200">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Abrir menú"
              aria-expanded={menuAbierto}
              aria-controls="menu-principal"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="min-w-0 flex-1">
              <Breadcrumbs />
            </div>

            <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:w-auto sm:flex-nowrap sm:justify-end sm:gap-4">
              <AccessibilityControls />
              <ThemeToggle />

              {usuarioActual && (
                <div className="contents sm:flex sm:min-w-0 sm:items-center sm:gap-4 sm:border-l sm:border-slate-200 sm:pl-4 sm:dark:border-slate-700">
                  <div className="order-3 w-full min-w-0 text-right sm:order-none sm:w-auto sm:max-w-[280px]">
                    <p className="break-words text-sm font-medium leading-snug text-slate-800 dark:text-slate-100">
                      {usuarioActual.nombreCompleto}
                    </p>
                    <p className="break-words text-xs leading-snug text-slate-500 dark:text-slate-400">
                      {usuarioActual.rol}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={manejarSalir}
                    className="order-2 inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-red-800 dark:hover:bg-red-950/40 dark:hover:text-red-300 sm:order-none sm:px-4"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    <span className="hidden sm:inline">Cerrar sesión</span>
                    <span className="sm:hidden">Salir</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={recargarUsuarios}
                className="font-semibold underline underline-offset-2"
              >
                Reintentar
              </button>
            </div>
          )}
        </header>

        <main
          id="contenido"
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8"
        >
          {!cargando && !error && usuariosActivos.length === 0 && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Aún no hay usuarios activos.{" "}
              <Link
                to="/usuarios"
                className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                Crea el primer administrador
              </Link>{" "}
              para empezar.
            </div>
          )}

          <div key={pathname} className="module-transition">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          ReservaUPLA · Sistema Institucional de Gestión de Ambientes · UPLA 2026
        </footer>
      </div>
    </div>
  );
}
