import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AlertMessage from "../components/AlertMessage.jsx";
import Button from "../components/Button.jsx";
import CardIndicador from "../components/CardIndicador.jsx";
import EstadoBadge from "../components/EstadoBadge.jsx";
import TableList from "../components/TableList.jsx";
import { ROLES, ROLES_CREAN_RESERVA } from "../constants/roles.js";
import { ESTADOS_RESERVA } from "../constants/estados.js";
import { useUsuarioActual } from "../context/useUsuarioActual.js";
import { ambienteService } from "../services/ambienteService.js";
import { dashboardService } from "../services/dashboardService.js";
import { reservaService } from "../services/reservaService.js";
import { obtenerMensajeError } from "../utils/apiErrors.js";
import { formatDate, formatTime } from "../utils/formatDate.js";

const CLASE_PRIMARIO =
  "inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-900/10 transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md motion-reduce:transform-none";
const COLUMNAS = [
  {
    clave: "fecha",
    encabezado: "Fecha",
    render: (reserva) => formatDate(reserva.fecha)
  },
  {
    clave: "horario",
    encabezado: "Horario",
    render: (reserva) =>
      `${formatTime(reserva.horaInicio)} a ${formatTime(reserva.horaFin)}`
  },
  { clave: "ambienteNombre", encabezado: "Ambiente" },
  { clave: "usuarioNombre", encabezado: "Solicitante" },
  {
    clave: "motivo",
    encabezado: "Motivo",
    render: (reserva) => (
      <span
        className="block max-w-[200px] truncate text-slate-700 dark:text-slate-200"
        title={reserva.motivo}
      >
        {reserva.motivo || "—"}
      </span>
    )
  },
  {
    clave: "estado",
    encabezado: "Estado",
    render: (reserva) => <EstadoBadge estado={reserva.estado} />
  },
  {
    clave: "acciones",
    encabezado: "Acciones",
    alineacion: "right",
    render: (reserva) => (
      <Link
        to={`/reservas/${reserva.id}`}
        className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
      >
        Ver
      </Link>
    )
  }
];

function Icono({ children }) {
  return (
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
      {children}
    </svg>
  );
}

function obtenerReservasPorMes(reservas, cantidadMeses = 6) {
  const hoy = new Date();
  const meses = Array.from({ length: cantidadMeses }, (_, indice) => {
    const fecha = new Date(
      hoy.getFullYear(),
      hoy.getMonth() - cantidadMeses + indice + 1,
      1
    );

    return {
      clave: `${fecha.getFullYear()}-${fecha.getMonth()}`,
      etiqueta: new Intl.DateTimeFormat("es-PE", { month: "short" })
        .format(fecha)
        .replace(".", ""),
      total: 0
    };
  });
  const mesesPorClave = new Map(meses.map((mes) => [mes.clave, mes]));

  reservas.forEach((reserva) => {
    if (!reserva.fechaRegistro) return;
    const fecha = new Date(reserva.fechaRegistro);
    if (Number.isNaN(fecha.getTime())) return;

    const mes = mesesPorClave.get(
      `${fecha.getFullYear()}-${fecha.getMonth()}`
    );
    if (mes) mes.total += 1;
  });

  return meses;
}

function obtenerUsoPorAmbiente(ambientes, reservas) {
  const usosPorNombre = new Map();

  reservas.forEach((reserva) => {
    if (reserva.estado !== ESTADOS_RESERVA.APROBADA || !reserva.ambienteNombre) {
      return;
    }

    usosPorNombre.set(
      reserva.ambienteNombre,
      (usosPorNombre.get(reserva.ambienteNombre) ?? 0) + 1
    );
  });

  return ambientes
    .map((ambiente) => ({
      id: ambiente.id,
      nombre: ambiente.nombre,
      total: usosPorNombre.get(ambiente.nombre) ?? 0
    }))
    .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre, "es"));
}

function GraficoReservasPorMes({ datos, cargando }) {
  const contenedorGraficoRef = useRef(null);
  const [altoGrafico, setAltoGrafico] = useState(208);
  const maximo = Math.max(...datos.map((mes) => mes.total), 1);
  const escala = Math.ceil(maximo / 4) * 4;
  const lineaBase = altoGrafico - 43;
  const altoGraficoDatos = lineaBase - 30;

  useEffect(() => {
    const contenedor = contenedorGraficoRef.current;
    if (!contenedor) return undefined;

    const observador = new ResizeObserver(([entrada]) => {
      setAltoGrafico(Math.max(208, Math.round(entrada.contentRect.height)));
    });

    observador.observe(contenedor);
    return () => observador.disconnect();
  }, []);

  const puntos = datos.map((mes, indice) => ({
    ...mes,
    x: datos.length > 1 ? 48 + (indice * 520) / (datos.length - 1) : 308,
    y: lineaBase - (mes.total / escala) * altoGraficoDatos
  }));
  const linea = puntos.map((punto) => `${punto.x},${punto.y}`).join(" ");
  const area = puntos.length
    ? `48,${lineaBase} ${linea} ${puntos.at(-1).x},${lineaBase}`
    : "";

  return (
    <section
      aria-labelledby="titulo-grafico-reservas"
      className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="titulo-grafico-reservas"
            className="text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            Reservas registradas por mes
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Cantidad de solicitudes creadas en los últimos seis meses.
          </p>
        </div>
        <span className="rounded-lg bg-brand-50 p-2 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300">
          <Icono>
            <path d="M4 19V5m0 14h16" />
            <path d="M8 15v-4m4 4V7m4 8V9m4 6V5" />
          </Icono>
        </span>
      </div>

      <div
        ref={contenedorGraficoRef}
        className="mt-5 flex min-h-52 flex-1 items-stretch overflow-x-auto"
        role="img"
        aria-label={`Solicitudes registradas por mes: ${datos
          .map((mes) => `${mes.etiqueta}: ${mes.total}`)
          .join(", ")}`}
        aria-busy={cargando || undefined}
      >
        {cargando ? (
          <div className="h-full min-h-52 w-full animate-pulse rounded-xl bg-slate-50 dark:bg-slate-800/50" />
        ) : (
          <svg
            viewBox={`0 0 600 ${altoGrafico}`}
            style={{ height: `${altoGrafico}px` }}
            className="min-w-[480px] w-full overflow-visible"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <linearGradient id="reservas-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#0077c8" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#0077c8" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4].map((paso) => {
              const y = lineaBase - (paso / 4) * altoGraficoDatos;
              const valor = Math.round((escala * paso) / 4);

              return (
                <g key={paso}>
                  <line
                    x1="42"
                    x2="584"
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.12"
                    strokeDasharray={paso === 0 ? undefined : "3 5"}
                  />
                  <text
                    x="32"
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-500 text-[11px] dark:fill-slate-400"
                  >
                    {valor}
                  </text>
                </g>
              );
            })}
            <polygon points={area} fill="url(#reservas-area)" />
            <polyline
              points={linea}
              fill="none"
              stroke="#0064a7"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {puntos.map((punto) => (
              <g key={punto.clave}>
                <circle
                  cx={punto.x}
                  cy={punto.y}
                  r="5"
                  fill="white"
                  stroke="#0064a7"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={punto.x}
                  y={Math.max(punto.y - 12, 12)}
                  textAnchor="middle"
                  className="fill-slate-700 text-xs font-semibold dark:fill-slate-200"
                >
                  {punto.total}
                </text>
                <text
                  x={punto.x}
                  y={altoGrafico - 10}
                  textAnchor="middle"
                  className="fill-slate-500 text-xs font-medium capitalize dark:fill-slate-400"
                >
                  {punto.etiqueta}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>
    </section>
  );
}

function GraficoUsoAmbientes({ datos, cargando }) {
  const maximo = Math.max(...datos.map((ambiente) => ambiente.total), 1);
  const ambienteMasUtilizado = datos[0];
  return (
    <section
      aria-labelledby="titulo-grafico-ambientes"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="titulo-grafico-ambientes"
            className="text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            Uso de ambientes
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Cantidad de reservas aprobadas por ambiente.
          </p>
        </div>
        <span className="rounded-lg bg-brand-50 p-2 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300">
          <Icono>
            <path d="M4 19V5m0 14h16" />
            <path d="M7 15h3m2-4h3m2-4h3" />
          </Icono>
        </span>
      </div>

      {!cargando && (
        <div
          className={`mt-4 flex items-center gap-3 rounded-xl border px-3.5 py-3 ${
            ambienteMasUtilizado?.total > 0
              ? "border-brand-200 bg-brand-50/80 text-brand-800 dark:border-brand-800/70 dark:bg-brand-950/40 dark:text-brand-200"
              : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300"
          }`}
        >
          {ambienteMasUtilizado?.total > 0 && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-300">
              <Icono>
                <path d="M8 21h8m-4-4v4" />
                <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
                <path d="M7 6H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4" />
                <path d="M9 4V2h6v2" />
              </Icono>
            </span>
          )}
          <p className="min-w-0 text-sm leading-relaxed">
            {ambienteMasUtilizado?.total > 0 ? (
              <>
                <span className="font-semibold">Ambiente más utilizado:</span>{" "}
                <span className="font-medium">{ambienteMasUtilizado.nombre}</span>
                <span className="whitespace-nowrap">
                  {" "}
                  · {ambienteMasUtilizado.total} reservas aprobadas
                </span>
              </>
            ) : (
              "Aún no hay reservas aprobadas registradas."
            )}
          </p>
        </div>
      )}

      <div
        className="mt-5 space-y-4"
        role="img"
        aria-label={`Reservas aprobadas por ambiente: ${datos
          .map((ambiente) => `${ambiente.nombre}: ${ambiente.total}`)
          .join(", ")}`}
        aria-busy={cargando || undefined}
      >
        {cargando ? (
          Array.from({ length: 4 }, (_, indice) => (
            <div key={indice} className="animate-pulse">
              <div className="mb-1.5 h-4 w-2/5 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>
          ))
        ) : datos.length ? (
          datos.map((ambiente) => (
            <div key={ambiente.id} className="min-w-0">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span
                  className="min-w-0 break-words text-sm font-medium text-slate-700 dark:text-slate-200"
                  title={ambiente.nombre}
                >
                  {ambiente.nombre}
                </span>
                <span className="shrink-0 text-sm font-bold tabular-nums text-brand-700 dark:text-brand-300">
                  {ambiente.total}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-400 transition-all duration-500 dark:from-brand-500 dark:to-brand-300"
                  style={{
                    width: `${ambiente.total ? (ambiente.total / maximo) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            No hay ambientes registrados.
          </p>
        )}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { usuarioActual, rolActual } = useUsuarioActual();
  const [resumen, setResumen] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      const [datosDashboard, lista, listaAmbientes] = await Promise.all([
        dashboardService.obtener(),
        reservaService.listar(),
        ambienteService.listar()
      ]);

      setResumen(datosDashboard);
      setReservas(lista ?? []);
      setAmbientes(listaAmbientes ?? []);
      setError("");
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudieron cargar los indicadores.")
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    // Consulta externa inicial (API).
    // oxlint-disable-next-line react/set-state-in-effect
    cargar();
  }, [cargar]);

  const reintentar = () => {
    setCargando(true);
    setError("");
    cargar();
  };

  const puedeCrear = ROLES_CREAN_RESERVA.includes(rolActual);
  const esAdmin = rolActual === ROLES.ADMINISTRADOR;
  const esResponsable = rolActual === ROLES.RESPONSABLE_AMBIENTE;
  const esSolicitante = rolActual === ROLES.SOLICITANTE;

  // Si es Solicitante, sus métricas y solicitudes recientes son personales
  const reservasPropias = useMemo(() => {
    if (!usuarioActual) return [];
    return reservas.filter(
      (r) =>
        r.usuarioId === usuarioActual.id ||
        (r.usuarioNombre &&
          usuarioActual.nombreCompleto &&
          r.usuarioNombre.trim().toLowerCase() ===
            usuarioActual.nombreCompleto.trim().toLowerCase())
    );
  }, [reservas, usuarioActual]);

  const metricasSolicitante = useMemo(() => {
    const total = reservasPropias.length;
    const pendientes = reservasPropias.filter(
      (r) => r.estado === ESTADOS_RESERVA.PENDIENTE
    ).length;
    const aprobadas = reservasPropias.filter(
      (r) => r.estado === ESTADOS_RESERVA.APROBADA
    ).length;
    const rechazadas = reservasPropias.filter(
      (r) => r.estado === ESTADOS_RESERVA.RECHAZADA
    ).length;
    return { total, pendientes, aprobadas, rechazadas };
  }, [reservasPropias]);

  const subtituloSegunRol = useMemo(() => {
    if (!usuarioActual) {
      return "Resumen general de las reservas de ambientes de la universidad.";
    }
    if (esAdmin) {
      return `Hola, ${usuarioActual.nombreCompleto}. Panel de control institucional: supervisa la trazabilidad, atiende solicitudes pendientes y analiza el uso del campus.`;
    }
    if (esResponsable) {
      return `Hola, ${usuarioActual.nombreCompleto}. Panel de supervisión de espacios: consulta la ocupación programada y planifica la logística de los ambientes.`;
    }
    // Solicitante / Docente
    return `Hola, ${usuarioActual.nombreCompleto}. Consulta el estado de tus solicitudes personales de reserva académica y disponibilidad de aulas.`;
  }, [usuarioActual, esAdmin, esResponsable]);
  const reservasPorMes = useMemo(
    () => obtenerReservasPorMes(reservas),
    [esSolicitante, reservasPropias, reservas]
  );
  const usoPorAmbiente = useMemo(
    () => obtenerUsoPorAmbiente(ambientes, reservas),
    [ambientes, reservas]
  );
  const reservasRecientes = useMemo(
    () =>
      [...(esSolicitante ? reservasPropias : reservas)]
        .sort(
          (a, b) =>
            new Date(b.fechaRegistro).getTime() -
            new Date(a.fechaRegistro).getTime()
        )
        .slice(0, 5),
    [esSolicitante, reservasPropias, reservas]
  );

  return (
    <section
      aria-labelledby="titulo-dashboard"
      className="relative"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
            ReservaUPLA · Campus Universitario
          </p>
          <h1 id="titulo-dashboard" className="page-title">
            Panel de Inicio
          </h1>
          <p className="page-subtitle">
            {subtituloSegunRol}
          </p>
        </div>

        {puedeCrear && (
          <Link to="/reservas?nueva=true" className={CLASE_PRIMARIO}>
            Nueva reserva
          </Link>
        )}
      </div>

      {error && (
        <AlertMessage
          tipo="error"
          titulo="No se pudieron cargar los datos"
          className="mt-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={reintentar}>
              Reintentar
            </Button>
          </div>
        </AlertMessage>
      )}

      <div className="mt-6 grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardIndicador
          titulo={esSolicitante ? "Mis solicitudes" : "Total de reservas"}
          valor={esSolicitante ? metricasSolicitante.total : (resumen?.totalReservas ?? "—")}
          descripcion={esSolicitante ? "Tus solicitudes registradas" : "Incluye las solicitudes canceladas"}
          tono="brand"
          cargando={cargando}
          className="min-h-[148px]"
          icono={
            <Icono>
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 11h18" />
            </Icono>
          }
        />

        <CardIndicador
          titulo={esSolicitante ? "Mis pendientes" : "Pendientes"}
          valor={esSolicitante ? metricasSolicitante.pendientes : (resumen?.pendientes ?? "—")}
          descripcion="Esperando aprobación"
          tono="warning"
          cargando={cargando}
          className="min-h-[148px]"
          icono={
            <Icono>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </Icono>
          }
        />

        <CardIndicador
          titulo={esSolicitante ? "Mis aprobadas" : "Aprobadas"}
          valor={esSolicitante ? metricasSolicitante.aprobadas : (resumen?.aprobadas ?? "—")}
          descripcion={esSolicitante ? "Confirmadas y vigentes" : "Reservas confirmadas"}
          tono="success"
          cargando={cargando}
          className="min-h-[148px]"
          icono={
            <Icono>
              <circle cx="12" cy="12" r="9" />
              <path d="M8.5 12.5l2.5 2.5 4.5-5" />
            </Icono>
          }
        />

        <CardIndicador
          titulo={esSolicitante ? "Mis rechazadas" : "Rechazadas"}
          valor={esSolicitante ? metricasSolicitante.rechazadas : (resumen?.rechazadas ?? "—")}
          descripcion="Solicitudes no aceptadas"
          tono="danger"
          cargando={cargando}
          className="min-h-[148px]"
          icono={
            <Icono>
              <circle cx="12" cy="12" r="9" />
              <path d="M9 9l6 6M15 9l-6 6" />
            </Icono>
          }
        />

      </div>

      <div className="mt-7 grid gap-4 xl:grid-cols-2">
        <GraficoReservasPorMes
          datos={reservasPorMes}
          cargando={cargando}
        />
        <GraficoUsoAmbientes datos={usoPorAmbiente} cargando={cargando} />
      </div>

      <TableList
        className="mt-8"
        titulo={esSolicitante ? "Mis solicitudes recientes" : "Últimas reservas registradas"}
        descripcion={esSolicitante ? "Tus solicitudes más recientes." : "Las 5 solicitudes más recientes."}
        columnas={COLUMNAS}
        datos={reservasRecientes}
        cargando={cargando}
        mensajeVacio={
          esSolicitante
            ? "Aún no has registrado solicitudes de reserva. Crea la primera."
            : "Aún no hay reservas. Crea la primera."
        }
        accionVacio={
          puedeCrear ? (
            <Link to="/reservas/nueva" className={CLASE_PRIMARIO}>
              Nueva reserva
            </Link>
          ) : null
        }
      />
    </section>
  );
}
