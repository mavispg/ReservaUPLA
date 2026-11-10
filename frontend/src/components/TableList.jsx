import { useState } from "react";

const EMPTY_ROWS = [];
const PAGE_SIZE = 10;

function clasesAlineacion(alineacion) {
  if (alineacion === "right") return "text-right";
  if (alineacion === "center") return "text-center";
  return "text-left";
}

/**
 * Tabla reutilizable con estados de carga, error y vacío.
 * Usa <th scope="col"> y un caption para lectores de pantalla.
 */
export default function TableList({
  titulo = "",
  descripcion = "",
  columnas = [],
  datos = [],
  claveFila = "id",
  cargando = false,
  error = "",
  mensajeVacio = "No hay registros para mostrar.",
  accionVacio = null,
  className = "",
  filasPorPagina = PAGE_SIZE
}) {
  const filas = Array.isArray(datos) ? datos : EMPTY_ROWS;
  const totalColumnas = Math.max(columnas.length, 1);
  const [paginacion, setPaginacion] = useState({ filas, pagina: 1 });
  const paginaGuardada = paginacion.filas === filas ? paginacion.pagina : 1;
  const cantidadPorPagina = Math.max(1, filasPorPagina);
  const totalPaginas = Math.ceil(filas.length / cantidadPorPagina);
  const paginaActual = Math.min(paginaGuardada, Math.max(totalPaginas, 1));
  const indiceInicial = (paginaActual - 1) * cantidadPorPagina;
  const filasVisibles = filas.slice(
    indiceInicial,
    indiceInicial + cantidadPorPagina
  );

  const cambiarPagina = (pagina) => {
    setPaginacion({ filas, pagina });
  };

  const obtenerPaginas = () => {
    if (totalPaginas <= 5) {
      return Array.from({ length: totalPaginas }, (_, indice) => indice + 1);
    }
    if (paginaActual <= 3) return [1, 2, 3, 4, "...", totalPaginas];
    if (paginaActual >= totalPaginas - 2) {
      return [
        1,
        "...",
        totalPaginas - 3,
        totalPaginas - 2,
        totalPaginas - 1,
        totalPaginas
      ];
    }
    return [
      1,
      "...",
      paginaActual - 1,
      paginaActual,
      paginaActual + 1,
      "...",
      totalPaginas
    ];
  };

  return (
    <section className={className}>
      {(titulo || descripcion) && (
        <div className="mb-3">
          {titulo && (
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{titulo}</h2>
          )}
          {descripcion && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{descripcion}</p>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-brand-100 bg-white shadow-sm shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/10">
        <div className="overflow-x-auto">
          <table
            className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700"
            aria-busy={cargando || undefined}
          >
            <caption className="sr-only">{titulo || "Listado de registros"}</caption>

            <thead className="bg-gradient-to-r from-brand-50 via-sky-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-800">
              <tr>
                {columnas.map((columna) => (
                  <th
                    key={columna.clave}
                    scope="col"
                    className={`whitespace-nowrap border-b-2 border-brand-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-800 dark:border-slate-700 dark:text-brand-200 ${clasesAlineacion(
                      columna.alineacion
                    )}`}
                  >
                    {columna.encabezado}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-brand-50 dark:divide-slate-700/80">
              {cargando &&
                Array.from({ length: 3 }).map((_, indice) => (
                  <tr key={`skeleton-${indice}`} aria-hidden="true">
                    {columnas.map((columna) => (
                      <td key={columna.clave} className="px-4 py-4">
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!cargando && error && (
                <tr>
                  <td colSpan={totalColumnas} className="px-4 py-6">
                    <div
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                    >
                      {error}
                    </div>
                  </td>
                </tr>
              )}

              {!cargando && !error && filas.length === 0 && (
                <tr>
                  <td
                    colSpan={totalColumnas}
                    className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    <p>{mensajeVacio}</p>
                    {accionVacio && <div className="mt-3">{accionVacio}</div>}
                  </td>
                </tr>
              )}

              {!cargando &&
                !error &&
                filasVisibles.map((fila, indice) => (
                  <tr
                    key={fila[claveFila] ?? indiceInicial + indice}
                    className="transition-colors even:bg-slate-50/60 hover:bg-brand-50/80 dark:even:bg-slate-900/20 dark:hover:bg-brand-900/20"
                  >
                    {columnas.map((columna) => (
                      <td
                        key={columna.clave}
                        className={`whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300 ${clasesAlineacion(
                          columna.alineacion
                        )} transition-colors`}
                      >
                        {columna.render
                          ? columna.render(fila)
                          : (fila[columna.clave] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!cargando && !error && totalPaginas > 1 && (
          <div className="flex flex-col gap-3 border-t border-brand-100 bg-slate-50/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40 sm:flex-row sm:items-center sm:justify-between">
            <p
              className="text-sm text-slate-600 dark:text-slate-400"
              aria-live="polite"
            >
              Mostrando{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {indiceInicial + 1}–
                {Math.min(indiceInicial + cantidadPorPagina, filas.length)}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {filas.length}
              </span>
            </p>
            <nav
              aria-label="Paginación de la tabla"
              className="flex items-center justify-center gap-1"
            >
              <button
                type="button"
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                aria-label="Página anterior"
                className="flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:bg-brand-900/30 dark:hover:text-brand-200"
              >
                Anterior
              </button>
              {obtenerPaginas().map((pagina, indice) =>
                pagina === "..." ? (
                  <span
                    key={`ellipsis-${indice}`}
                    aria-hidden="true"
                    className="px-1 text-slate-500 dark:text-slate-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={pagina}
                    type="button"
                    onClick={() => cambiarPagina(pagina)}
                    aria-label={`Página ${pagina}`}
                    aria-current={pagina === paginaActual ? "page" : undefined}
                    className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      pagina === paginaActual
                        ? "bg-brand-700 text-white shadow-sm dark:bg-brand-500 dark:text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:bg-brand-900/30 dark:hover:text-brand-200"
                    }`}
                  >
                    {pagina}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                aria-label="Página siguiente"
                className="flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:bg-brand-900/30 dark:hover:text-brand-200"
              >
                Siguiente
              </button>
            </nav>
          </div>
        )}
      </div>
    </section>
  );
}
