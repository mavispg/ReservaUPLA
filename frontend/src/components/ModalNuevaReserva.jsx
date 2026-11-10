import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AlertMessage from "./AlertMessage.jsx";
import Button from "./Button.jsx";
import DateInput from "./DateInput.jsx";
import SelectInput from "./SelectInput.jsx";
import Spinner from "./Spinner.jsx";
import TextAreaInput from "./TextAreaInput.jsx";
import TimeInput from "./TimeInput.jsx";
import { ESTADOS_AMBIENTE } from "../constants/ambientes.js";
import { useUsuarioActual } from "../context/useUsuarioActual.js";
import useDialogAccessibility from "../hooks/useDialogAccessibility.js";
import { ambienteService } from "../services/ambienteService.js";
import { reservaService } from "../services/reservaService.js";
import { extraerErroresCampo, obtenerMensajeError } from "../utils/apiErrors.js";
import { hoyISO, normalizarHora } from "../utils/formatDate.js";
import { normalizeText } from "../utils/normalizeText.js";
import { validarCampoReserva } from "../utils/validation.js";

const FORMULARIO_INICIAL = {
  ambienteId: "",
  fecha: "",
  horaInicio: "",
  horaFin: "",
  motivo: ""
};

const MAPA_ERRORES = {
  ambienteId: "AmbienteId",
  fecha: "Fecha",
  horaInicio: "HoraInicio",
  horaFin: "HoraFin",
  motivo: "Motivo"
};

/**
 * Modal accesible para registrar una nueva reserva (DCU / ISO 9241-110).
 * Mantiene el contexto de la grilla de reservas sin redirigir al usuario
 * a una pantalla vacía innecesaria.
 */
export default function ModalNuevaReserva({
  abierto,
  onCerrar,
  onReservaCreada
}) {
  const { usuarioActual } = useUsuarioActual();
  const [fechaMinima] = useState(() => hoyISO());

  const [ambientes, setAmbientes] = useState([]);
  const [cargandoAmbientes, setCargandoAmbientes] = useState(false);
  const [errorAmbientes, setErrorAmbientes] = useState("");

  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const enviandoRef = useRef(false);
  const dialogRef = useDialogAccessibility({
    abierto,
    onCerrar,
    bloqueado: enviando,
    enfocarPrimerCampo: false
  });

  // Cargar ambientes activos al abrir el modal
  const cargarAmbientes = useCallback(async () => {
    setCargandoAmbientes(true);
    setErrorAmbientes("");
    try {
      const lista = await ambienteService.listar();
      setAmbientes(
        lista.filter((a) => a.estado === ESTADOS_AMBIENTE.ACTIVO)
      );
    } catch (err) {
      setErrorAmbientes(
        obtenerMensajeError(err, "No se pudieron cargar los ambientes.")
      );
    } finally {
      setCargandoAmbientes(false);
    }
  }, []);

  useEffect(() => {
    if (abierto) {
      cargarAmbientes();
      setFormulario(FORMULARIO_INICIAL);
      setErrores({});
      setErrorGeneral("");
      enviandoRef.current = false;
    }
  }, [abierto, cargarAmbientes]);

  if (!abierto) return null;

  const actualizarCampo = (campo) => (event) => {
    const valor = event.target.value;
    setFormulario((prev) => ({
      ...prev,
      [campo]: valor,
      ...(campo === "horaInicio" ? { horaFin: "" } : {})
    }));
    if (campo === "horaInicio") {
      setErrores((prev) => ({ ...prev, horaFin: "" }));
    }

    // Revalidación inmediata en caliente
    if (errores[campo]) {
      const errorInmediato = validarCampoReserva(
        campo,
        valor,
        { ...formulario, [campo]: valor },
        fechaMinima
      );
      setErrores((prev) => ({ ...prev, [campo]: errorInmediato }));
    }
  };

  const manejarBlur = (campo) => () => {
    const errorCampo = validarCampoReserva(
      campo,
      formulario[campo],
      formulario,
      fechaMinima
    );
    setErrores((prev) => ({ ...prev, [campo]: errorCampo }));
  };

  const validar = () => {
    const campos = ["ambienteId", "fecha", "horaInicio", "horaFin", "motivo"];
    const nuevos = {};

    campos.forEach((campo) => {
      const err = validarCampoReserva(campo, formulario[campo], formulario, fechaMinima);
      if (err) nuevos[campo] = err;
    });

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const manejarEnvio = async (event) => {
    event.preventDefault();
    setErrorGeneral("");

    if (enviandoRef.current) return;

    if (!usuarioActual) {
      setErrorGeneral("No hay una sesión activa para registrar la solicitud.");
      return;
    }

    if (!validar()) {
      setErrorGeneral("Por favor revisa los campos marcados en rojo.");
      return;
    }

    setEnviando(true);
    enviandoRef.current = true;

    try {
      const creada = await reservaService.crear({
        ambienteId: formulario.ambienteId,
        fecha: formulario.fecha,
        horaInicio: normalizarHora(formulario.horaInicio),
        horaFin: normalizarHora(formulario.horaFin),
        motivo: normalizeText(formulario.motivo),
        usuarioId: usuarioActual.id
      });

      onReservaCreada(creada);
      onCerrar();
    } catch (err) {
      const erroresCampos = extraerErroresCampo(err, MAPA_ERRORES);
      setErrores(erroresCampos);
      setErrorGeneral(
        Object.keys(erroresCampos).length > 0
          ? "Revisa los campos marcados."
          : obtenerMensajeError(err)
      );
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  };

  const opcionesAmbientes = ambientes.map((a) => ({
    value: a.id,
    label: `${a.nombre} (${a.tipo} · Cap. ${a.capacidad})`
  }));

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Fondo atenuado (Backdrop) */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
        onClick={() => {
          if (!enviando) onCerrar();
        }}
      />

      {/* Contenedor del Modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-nueva-reserva"
        tabIndex={-1}
        className="relative my-8 w-full max-w-3xl rounded-2xl bg-white p-6 sm:p-7 shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-800 transition-all max-h-[90vh] flex flex-col"
      >
        {/* Cabecera del modal */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </span>
              <h2
                id="titulo-modal-nueva-reserva"
                className="text-lg font-bold text-slate-900 dark:text-slate-100"
              >
                Nueva solicitud de reserva
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Registra una solicitud a nombre de{" "}
              <strong className="text-slate-700 dark:text-slate-300">
                {usuarioActual?.nombreCompleto}
              </strong>
              . Quedará en estado pendiente de aprobación.
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            disabled={enviando}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors hover:bg-red-100 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-red-950/50 dark:hover:text-red-300"
            aria-label="Cerrar modal"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Mensaje de error general si aplica */}
        {errorGeneral && (
          <div className="mt-4">
            <AlertMessage tipo="error" titulo="No se pudo registrar la reserva">
              {errorGeneral}
            </AlertMessage>
          </div>
        )}

        {errorAmbientes && (
          <div className="mt-4">
            <AlertMessage tipo="warning" titulo="Error de ambientes">
              {errorAmbientes}
            </AlertMessage>
          </div>
        )}

        {/* Formulario */}
        <form
          onSubmit={manejarEnvio}
          className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1"
          noValidate
        >
          <SelectInput
            label="Ambiente institucional"
            options={opcionesAmbientes}
            value={formulario.ambienteId}
            onChange={actualizarCampo("ambienteId")}
            onBlur={manejarBlur("ambienteId")}
            error={errores.ambienteId}
            placeholder={
              cargandoAmbientes
                ? "Cargando ambientes activos..."
                : ambientes.length === 0
                ? "No hay ambientes activos disponibles"
                : "Selecciona el ambiente"
            }
            hint="Solo se muestran ambientes en estado Activo."
            required
            disabled={enviando || cargandoAmbientes || ambientes.length === 0}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-1">
              <DateInput
                label="Fecha de la reserva"
                value={formulario.fecha}
                onChange={actualizarCampo("fecha")}
                onBlur={manejarBlur("fecha")}
                error={errores.fecha}
                min={fechaMinima}
                hint="Selecciona hoy o una fecha posterior."
                required
                disabled={enviando}
              />
            </div>

            <div className="sm:col-span-1">
              <TimeInput
                label="Hora de inicio"
                value={formulario.horaInicio}
                onChange={actualizarCampo("horaInicio")}
                onBlur={manejarBlur("horaInicio")}
                error={errores.horaInicio}
                hint="Formato de 24 horas (HH:MM), por ejemplo 13:30."
                required
                disabled={enviando}
              />
            </div>

            <div className="sm:col-span-1">
              <TimeInput
                label="Hora de fin"
                value={formulario.horaFin}
                onChange={actualizarCampo("horaFin")}
                onBlur={manejarBlur("horaFin")}
                error={errores.horaFin}
                hint={
                  formulario.horaInicio
                    ? `Formato de 24 horas · después de ${formulario.horaInicio}.`
                    : "Selecciona primero la hora de inicio."
                }
                required
                disabled={enviando || !formulario.horaInicio}
              />
            </div>
          </div>

          <TextAreaInput
            label="Motivo académico / institucional"
            value={formulario.motivo}
            onChange={actualizarCampo("motivo")}
            onBlur={manejarBlur("motivo")}
            error={errores.motivo}
            placeholder="Ejemplo: Sesión de laboratorio para la asignatura Construcción de Software"
            hint="Describe el propósito académico de la reserva (mínimo 5 caracteres)."
            maxLength={500}
            rows={3}
            required
            disabled={enviando}
          />

          {/* Pie de acciones del modal */}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-700">
            <Button
              type="button"
              variant="secondary"
              onClick={onCerrar}
              disabled={enviando}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={enviando || cargandoAmbientes || ambientes.length === 0}
            >
              {enviando ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4 text-white" />
                  Registrando...
                </span>
              ) : (
                "Registrar reserva"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
