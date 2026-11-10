import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AlertMessage from "../components/AlertMessage.jsx";
import Button from "../components/Button.jsx";
import EstadoBadge from "../components/EstadoBadge.jsx";
import ModalConfirmacion from "../components/ModalConfirmacion.jsx";
import Spinner from "../components/Spinner.jsx";
import { ESTADOS_RESERVA } from "../constants/estados.js";
import { ROLES } from "../constants/roles.js";
import { useUsuarioActual } from "../context/useUsuarioActual.js";
import { reservaService } from "../services/reservaService.js";
import { obtenerMensajeError } from "../utils/apiErrors.js";
import {
  formatDate,
  formatDateTime,
  formatTime
} from "../utils/formatDate.js";

const ACCIONES = {
  [ESTADOS_RESERVA.APROBADA]: {
    titulo: "Aprobar reserva",
    mensaje:
      "La reserva pasará a estado Aprobada. Se volverá a validar que no exista otro traslape en el mismo ambiente y horario.",
    textoConfirmar: "Aprobar",
    variante: "primario",
    exito: "Reserva aprobada correctamente."
  },
  [ESTADOS_RESERVA.RECHAZADA]: {
    titulo: "Rechazar reserva",
    mensaje:
      "La reserva pasará a estado Rechazada y ya no podrá modificarse. ¿Deseas continuar?",
    textoConfirmar: "Rechazar",
    variante: "peligro",
    exito: "Reserva rechazada correctamente."
  },
  [ESTADOS_RESERVA.CANCELADA]: {
    titulo: "Cancelar reserva",
    mensaje:
      "La reserva quedará cancelada y el horario volverá a estar libre. Esta acción no se puede deshacer.",
    textoConfirmar: "Cancelar reserva",
    variante: "peligro",
    exito: "Reserva cancelada correctamente."
  }
};

function Dato({ etiqueta, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {etiqueta}
      </dt>
      <dd className="mt-1 text-sm text-slate-800 dark:text-slate-100">{children}</dd>
    </div>
  );
}

export default function DetalleReservaPage() {
  const { id } = useParams();
  const { usuarioActual } = useUsuarioActual();

  const [reserva, setReserva] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [accion, setAccion] = useState(null);
  const [ejecutando, setEjecutando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [errorAccion, setErrorAccion] = useState("");

  const cargar = useCallback(async () => {
    try {
      const datos = await reservaService.obtenerPorId(id);
      setReserva(datos);
      setError("");
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudo cargar la reserva.")
      );
    } finally {
      setCargando(false);
    }
  }, [id]);

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

  const esAdministrador = usuarioActual?.rol === ROLES.ADMINISTRADOR;
  const esPropietario =
    Boolean(usuarioActual && reserva) &&
    reserva.usuarioId === usuarioActual.id;

  const estado = reserva?.estado;
  const esPendiente = estado === ESTADOS_RESERVA.PENDIENTE;
  const esAprobada = estado === ESTADOS_RESERVA.APROBADA;
  const esFinal =
    estado === ESTADOS_RESERVA.RECHAZADA ||
    estado === ESTADOS_RESERVA.CANCELADA;

  const puedeAprobar = esAdministrador && esPendiente;
  const puedeRechazar = esAdministrador && esPendiente;
  const puedeCancelar =
    Boolean(usuarioActual) &&
    (esAdministrador || esPropietario) &&
    (esPendiente || esAprobada);

  const abrirAccion = (nuevoEstado) => {
    setMensajeExito("");
    setErrorAccion("");
    setAccion(nuevoEstado);
  };

  const cerrarModal = () => {
    if (!ejecutando) setAccion(null);
  };

  const confirmarAccion = async () => {
    if (!accion || !usuarioActual || !reserva) return;

    setEjecutando(true);

    try {
      await reservaService.cambiarEstado(reserva.id, {
        estado: accion,
        usuarioAccionId: usuarioActual.id
      });

      setMensajeExito(ACCIONES[accion].exito);
      setErrorAccion("");
      setAccion(null);
      await cargar();
    } catch (err) {
      setAccion(null);
      setErrorAccion(obtenerMensajeError(err));
      await cargar();
    } finally {
      setEjecutando(false);
    }
  };

  if (cargando) {
    return (
      <section aria-labelledby="titulo-detalle">
        <h1 id="titulo-detalle" className="page-title">
          Detalle de reserva
        </h1>
        <div className="card mt-6 flex items-center gap-3 p-6 text-sm text-slate-600">
          <Spinner className="h-5 w-5 text-brand-600" />
          Cargando reserva...
        </div>
      </section>
    );
  }

  if (error || !reserva) {
    return (
      <section aria-labelledby="titulo-detalle">
        <h1 id="titulo-detalle" className="page-title">
          Detalle de reserva
        </h1>
        <AlertMessage
          tipo="error"
          titulo="No se pudo cargar la reserva"
          className="mt-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span>{error || "La reserva no existe."}</span>
            <Button variant="secondary" size="sm" onClick={reintentar}>
              Reintentar
            </Button>
          </div>
        </AlertMessage>
        <div className="mt-6">
          <Link
            to="/reservas"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            ← Volver al listado
          </Link>
        </div>
      </section>
    );
  }

  const configuracionAccion = accion ? ACCIONES[accion] : null;

  return (
    <section aria-labelledby="titulo-detalle">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
            Reserva
          </p>
          <h1 id="titulo-detalle" className="page-title">
            Detalle de reserva
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <EstadoBadge estado={reserva.estado} />
            <span className="break-all font-mono text-xs text-slate-500">
              {reserva.id}
            </span>
          </div>
        </div>

        <Link
          to="/reservas"
          className="text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
        >
          ← Volver al listado
        </Link>
      </div>

      {mensajeExito && (
        <AlertMessage
          tipo="success"
          titulo="Acción completada"
          className="mt-6"
          onClose={() => setMensajeExito("")}
        >
          {mensajeExito}
        </AlertMessage>
      )}

      {errorAccion && (
        <AlertMessage
          tipo="error"
          titulo="No se pudo completar la acción"
          className="mt-6"
          onClose={() => setErrorAccion("")}
        >
          {errorAccion}
        </AlertMessage>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Datos de la reserva
          </h2>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Dato etiqueta="Fecha">{formatDate(reserva.fecha)}</Dato>
            <Dato etiqueta="Horario">
              {formatTime(reserva.horaInicio)} a {formatTime(reserva.horaFin)}
            </Dato>
            <Dato etiqueta="Ambiente">{reserva.ambienteNombre}</Dato>
            <Dato etiqueta="Tipo de ambiente">{reserva.ambienteTipo}</Dato>
            <Dato etiqueta="Ubicación">{reserva.ambienteUbicacion}</Dato>
            <Dato etiqueta="Capacidad">
              {reserva.ambienteCapacidad} personas
            </Dato>
            <Dato etiqueta="Solicitante">{reserva.usuarioNombre}</Dato>
            <Dato etiqueta="Correo del solicitante">
              {reserva.usuarioCorreo}
            </Dato>
            <Dato etiqueta="Fecha de registro">
              {formatDateTime(reserva.fechaRegistro)}
            </Dato>
          </dl>

          <div className="mt-5 border-t border-slate-200 dark:border-slate-700 pt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Motivo
            </h2>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              {reserva.motivo}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Acciones</h2>

            {!usuarioActual && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Inicia sesión para ejecutar acciones.
              </p>
            )}

            {usuarioActual && esFinal && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Esta reserva ya no puede modificarse (estado{" "}
                {reserva.estado.toLowerCase()}).
              </p>
            )}

            {usuarioActual && !esFinal && (
              <div className="mt-4 flex flex-col gap-2">
                {puedeAprobar && (
                  <Button onClick={() => abrirAccion(ESTADOS_RESERVA.APROBADA)}>
                    Aprobar
                  </Button>
                )}
                {puedeRechazar && (
                  <Button
                    variant="danger"
                    onClick={() => abrirAccion(ESTADOS_RESERVA.RECHAZADA)}
                  >
                    Rechazar
                  </Button>
                )}
                {puedeCancelar && (
                  <Button
                    variant="secondary"
                    onClick={() => abrirAccion(ESTADOS_RESERVA.CANCELADA)}
                  >
                    Cancelar reserva
                  </Button>
                )}
              </div>
            )}

            {usuarioActual && !esAdministrador && esPendiente && (
              <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Solo un administrador puede aprobar o rechazar esta solicitud.
              </p>
            )}

            {usuarioActual &&
              !puedeAprobar &&
              !puedeRechazar &&
              !puedeCancelar &&
              !esFinal && (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  No tienes acciones disponibles para esta reserva.
                </p>
              )}
          </div>

          <div className="card p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Auditoría
            </h2>
            <dl className="mt-3 space-y-3">
              <Dato etiqueta="Resuelta por">
                {reserva.resueltoPorNombre ?? "Aún no resuelta"}
              </Dato>
              <Dato etiqueta="Fecha de resolución">
                {formatDateTime(reserva.fechaResolucion)}
              </Dato>
            </dl>
          </div>
        </div>
      </div>

      <ModalConfirmacion
        abierto={Boolean(accion)}
        titulo={configuracionAccion?.titulo ?? "Confirmar acción"}
        mensaje={configuracionAccion?.mensaje ?? ""}
        textoConfirmar={configuracionAccion?.textoConfirmar ?? "Confirmar"}
        variante={configuracionAccion?.variante ?? "primario"}
        cargando={ejecutando}
        onConfirmar={confirmarAccion}
        onCerrar={cerrarModal}
      />
    </section>
  );
}
