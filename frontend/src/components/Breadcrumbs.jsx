import { Link, useLocation } from "react-router-dom";

const NOMBRES = {
  dashboard: "Inicio",
  reservas: "Reservas",
  usuarios: "Usuarios",
  ambientes: "Ambientes",
  componentes: "Componentes"
};

function construirMigas(pathname) {
  const segmentos = pathname.split("/").filter(Boolean);

  // Si estamos en la raíz o en /dashboard
  if (segmentos.length === 0 || (segmentos.length === 1 && segmentos[0] === "dashboard")) {
    return [{ etiqueta: "Inicio", to: "/dashboard" }];
  }

  // Módulos principales: cada uno es su propia raíz (Arquitectura de Información ortogonal)
  const moduloRaiz = segmentos[0];
  const nombreModulo = NOMBRES[moduloRaiz] ?? moduloRaiz;
  const migas = [{ etiqueta: nombreModulo, to: `/${moduloRaiz}` }];

  // Si hay sub-rutas (ej: /reservas/:id)
  if (segmentos.length > 1) {
    const sub = segmentos[1];
    // Si es un GUID o ID de reserva
    const esId = /^[0-9a-fA-F-]{8,}/.test(sub);
    const etiquetaSub = esId ? "Detalle de reserva" : (NOMBRES[sub] ?? sub);
    migas.push({
      etiqueta: etiquetaSub,
      to: `/${moduloRaiz}/${sub}`
    });
  }

  return migas;
}

/** Migas de pan: orientan al usuario dentro de la jerarquía de pantallas. */
export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const migas = construirMigas(pathname);
  const migaAnterior = migas.length > 2 ? migas[migas.length - 2] : null;

  return (
    <nav aria-label="Migas de pan" className="flex min-w-0 items-center gap-2">
      {migaAnterior && (
        <Link
          to={migaAnterior.to}
          aria-label={`Volver a ${migaAnterior.etiqueta}`}
          title={`Volver a ${migaAnterior.etiqueta}`}
          className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-brand-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-brand-400"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
      )}
      <ol className="flex min-w-0 flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        {migas.map((miga, indice) => {
          const esUltima = indice === migas.length - 1;

          return (
            <li
              key={`${miga.etiqueta}-${indice}`}
              className="flex min-w-0 items-center gap-1"
            >
              {indice > 0 && (
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                  /
                </span>
              )}
              {esUltima ? (
                <span
                  aria-current="page"
                  className="truncate font-medium text-slate-700 dark:text-slate-200"
                >
                  {miga.etiqueta}
                </span>
              ) : (
                <Link
                  to={miga.to}
                  className="rounded px-1 hover:text-brand-700 dark:hover:text-brand-400"
                >
                  {miga.etiqueta}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
