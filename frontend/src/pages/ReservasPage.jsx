import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AlertMessage from "../components/AlertMessage.jsx";
import Button from "../components/Button.jsx";
import DateInput from "../components/DateInput.jsx";
import EstadoBadge from "../components/EstadoBadge.jsx";
import ModalNuevaReserva from "../components/ModalNuevaReserva.jsx";
import SelectInput from "../components/SelectInput.jsx";
import TableList from "../components/TableList.jsx";
import { ESTADOS_RESERVA_OPCIONES } from "../constants/estados.js";
import { ROLES, ROLES_CREAN_RESERVA } from "../constants/roles.js";
import { useUsuarioActual } from "../context/useUsuarioActual.js";
import { ambienteService } from "../services/ambienteService.js";
import { reservaService } from "../services/reservaService.js";
import { obtenerMensajeError } from "../utils/apiErrors.js";
import { formatDate, formatTime } from "../utils/formatDate.js";

const FILTROS_INICIALES = {
  estado: "",
  ambienteId: "",
  fecha: ""
};

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
        className="block max-w-[220px] truncate text-slate-700 dark:text-slate-200"
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

export default function ReservasPage() {
  const { usuarioActual, rolActual } = useUsuarioActual();
  const puedeCrear = ROLES_CREAN_RESERVA.includes(rolActual);
  const esSolicitante = rolActual === ROLES.SOLICITANTE;

  const [searchParams, setSearchParams] = useSearchParams();
  const [modalNuevaAbierto, setModalNuevaAbierto] = useState(false);
  const [reservaReciente, setReservaReciente] = useState(null);

  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);

  const [ambientes, setAmbientes] = useState([]);
  const [cargandoAmbientes, setCargandoAmbientes] = useState(true);
  const [errorAmbientes, setErrorAmbientes] = useState("");

  // Apertura automática si llega ?nueva=1 o ?nueva=true desde Dashboard u otra vista
  useEffect(() => {
    if (searchParams.get("nueva") === "1" || searchParams.get("nueva") === "true") {
      setModalNuevaAbierto(true);
      const nuevosParams = new URLSearchParams(searchParams);
      nuevosParams.delete("nueva");
      setSearchParams(nuevosParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const cargarReservas = useCallback(async (filtrosActuales) => {
    try {
      const lista = await reservaService.listar(filtrosActuales);
      setReservas(lista);
      setError("");
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudieron cargar las reservas.")
      );
      setReservas([]);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarAmbientes = useCallback(async () => {
    try {
      const lista = await ambienteService.listar();
      setAmbientes(lista);
      setErrorAmbientes("");
    } catch (err) {
      setErrorAmbientes(
        obtenerMensajeError(err, "No se pudieron cargar los ambientes.")
      );
    } finally {
      setCargandoAmbientes(false);
    }
  }, []);

  useEffect(() => {
    // Cargas externas iniciales (API).
    // oxlint-disable-next-line react/set-state-in-effect
    cargarReservas(FILTROS_INICIALES);
    cargarAmbientes();
  }, [cargarReservas, cargarAmbientes]);

  const manejarReservaCreada = (creada) => {
    setReservaReciente(creada);
    cargarReservas(filtros);
  };

  const aplicarFiltros = (event) => {
    event.preventDefault();
    setCargando(true);
    cargarReservas(filtros);
  };

  const limpiarFiltros = () => {
    setFiltros(FILTROS_INICIALES);
    setCargando(true);
    cargarReservas(FILTROS_INICIALES);
  };

  const reintentarReservas = () => {
    setCargando(true);
    setError("");
    cargarReservas(filtros);
  };

  const reintentarAmbientes = () => {
    setCargandoAmbientes(true);
    setErrorAmbientes("");
    cargarAmbientes();
  };

  const opcionesAmbientes = ambientes.map((ambiente) => ({
    value: ambiente.id,
    label: ambiente.nombre
  }));

  const hayFiltros = Boolean(
    filtros.estado || filtros.ambienteId || filtros.fecha
  );

  // Si es Solicitante (Docente), solo visualiza sus propias solicitudes personales.
  // Administradores y Responsables visualizan todas las reservas del campus.
  const reservasVisibles = useMemo(() => {
    if (!esSolicitante || !usuarioActual) return reservas;
    return reservas.filter(
      (r) =>
        r.usuarioId === usuarioActual.id ||
        (r.usuarioNombre &&
          usuarioActual.nombreCompleto &&
          r.usuarioNombre.trim().toLowerCase() ===
            usuarioActual.nombreCompleto.trim().toLowerCase())
    );
  }, [reservas, esSolicitante, usuarioActual]);

  return (
    <section aria-labelledby="titulo-reservas">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="titulo-reservas" className="page-title">
            {esSolicitante ? "Mis Reservas" : "Reservas"}
          </h1>
          <p className="page-subtitle">
            {esSolicitante
              ? `Hola, ${usuarioActual?.nombreCompleto || "Docente"}. Consulta y da seguimiento a tus solicitudes personales de reserva académica.`
              : "Consulta las solicitudes, filtra por estado, ambiente o fecha y abre el detalle para aprobar, rechazar o cancelar."}
          </p>
        </div>

        {puedeCrear && (
          <button
            type="button"
            onClick={() => setModalNuevaAbierto(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nueva reserva</span>
          </button>
        )}
      </div>

      {reservaReciente && (
        <AlertMessage
          tipo="success"
          titulo="Reserva registrada con éxito"
          className="mt-6"
          onClose={() => setReservaReciente(null)}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              La solicitud para{" "}
              <strong>{reservaReciente.ambienteNombre || "el ambiente"}</strong> del{" "}
              <strong>{formatDate(reservaReciente.fecha)}</strong> quedó pendiente de aprobación.
            </p>
            <Link
              to={`/reservas/${reservaReciente.id}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 underline underline-offset-2 dark:text-emerald-300"
            >
              <span>Ver detalle de la solicitud</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </AlertMessage>
      )}

      {/* Modal accesible para registrar reservas */}
      <ModalNuevaReserva
        abierto={modalNuevaAbierto}
        onCerrar={() => setModalNuevaAbierto(false)}
        onReservaCreada={manejarReservaCreada}
      />

      <form
        className="card mt-6 p-5"
        onSubmit={aplicarFiltros}
        aria-label="Filtros de reservas"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <SelectInput
            label="Estado"
            options={ESTADOS_RESERVA_OPCIONES}
            value={filtros.estado}
            onChange={(event) =>
              setFiltros((previos) => ({
                ...previos,
                estado: event.target.value
              }))
            }
            placeholder="Todos los estados"
          />

          <SelectInput
            label="Ambiente"
            options={opcionesAmbientes}
            value={filtros.ambienteId}
            onChange={(event) =>
              setFiltros((previos) => ({
                ...previos,
                ambienteId: event.target.value
              }))
            }
            placeholder={
              cargandoAmbientes
                ? "Cargando ambientes..."
                : "Todos los ambientes"
            }
            disabled={cargandoAmbientes}
          />

          <DateInput
            label="Fecha"
            value={filtros.fecha}
            onChange={(event) =>
              setFiltros((previos) => ({
                ...previos,
                fecha: event.target.value
              }))
            }
            hint="Déjala vacía para ver todas las fechas."
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="submit" loading={cargando} loadingText="Filtrando...">
            Filtrar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={limpiarFiltros}
            disabled={cargando}
          >
            Limpiar filtros
          </Button>
        </div>

        {errorAmbientes && (
          <div className="mt-4">
            <AlertMessage tipo="warning">
              <div className="flex flex-wrap items-center gap-3">
                <span>{errorAmbientes}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={reintentarAmbientes}
                >
                  Reintentar ambientes
                </Button>
              </div>
            </AlertMessage>
          </div>
        )}
      </form>

      {error ? (
        <AlertMessage
          tipo="error"
          titulo="No se pudieron cargar las reservas"
          className="mt-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={reintentarReservas}>
              Reintentar
            </Button>
          </div>
        </AlertMessage>
      ) : (
        <TableList
          className="mt-8"
          titulo={esSolicitante ? "Mis solicitudes de reserva" : "Listado de reservas"}
          descripcion={
            cargando
              ? "Cargando reservas..."
              : reservasVisibles.length === 1
                ? "1 reserva encontrada."
                : `${reservasVisibles.length} reservas encontradas.`
          }
          columnas={COLUMNAS}
          datos={reservasVisibles}
          cargando={cargando}
          mensajeVacio={
            hayFiltros
              ? "No se encontraron reservas con esos filtros."
              : esSolicitante
                ? "Aún no has registrado solicitudes de reserva. Crea la primera."
                : "Aún no hay reservas registradas en el sistema."
          }
          accionVacio={
            !hayFiltros && puedeCrear ? (
              <Link
                to="/reservas/nueva"
                className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                Nueva reserva
              </Link>
            ) : null
          }
        />
      )}
    </section>
  );
}
