import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FieldWrapper from "./FieldWrapper.jsx";

const NOMBRES_DIAS = ["L", "M", "X", "J", "V", "S", "D"];
const CLASE_DIA =
  "flex h-9 w-9 items-center justify-center rounded-lg text-sm transition hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-brand-950 dark:hover:text-brand-200";

function fechaDesdeISO(valor) {
  if (!valor) return null;
  const [anio, mes, dia] = valor.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function aISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function obtenerDiasMes(fechaMes) {
  const primero = new Date(
    fechaMes.getFullYear(),
    fechaMes.getMonth(),
    1
  );
  const inicio = new Date(primero);
  inicio.setDate(primero.getDate() - ((primero.getDay() + 6) % 7));

  return Array.from({ length: 42 }, (_, indice) => {
    const fecha = new Date(inicio);
    fecha.setDate(inicio.getDate() + indice);
    return fecha;
  });
}

function ajustarMes(fecha, cantidad) {
  return new Date(fecha.getFullYear(), fecha.getMonth() + cantidad, 1);
}

function MoverMesIcono({ anterior = false }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-4 w-4 ${anterior ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="m7.5 4 6 6-6 6" />
    </svg>
  );
}

export default function DateInput({
  id,
  label,
  error = "",
  hint = "",
  required = false,
  min,
  max,
  className = "",
  value = "",
  onChange,
  onBlur,
  disabled = false,
  name
}) {
  const autoId = useId().replace(/:/g, "");
  const inputId = id ?? `fecha-${autoId}`;
  const calendarioId = `${inputId}-calendario`;
  const contenedorRef = useRef(null);
  const botonRef = useRef(null);
  const calendarioRef = useRef(null);
  const [abierto, setAbierto] = useState(false);
  const [posicionCalendario, setPosicionCalendario] = useState({
    top: 0,
    left: 0,
    width: 288,
    maxHeight: 360
  });
  const [mesVisible, setMesVisible] = useState(() => {
    const seleccionada = fechaDesdeISO(value);
    const minima = fechaDesdeISO(min);
    const fechaBase = seleccionada ?? minima ?? new Date();
    return new Date(fechaBase.getFullYear(), fechaBase.getMonth(), 1);
  });
  const seleccionada = fechaDesdeISO(value);
  const [hoy] = useState(() => aISO(new Date()));
  const dias = obtenerDiasMes(mesVisible);
  const etiquetaMes = new Intl.DateTimeFormat("es-PE", {
    month: "long",
    year: "numeric"
  }).format(mesVisible);
  const fechaLegible = seleccionada
    ? new Intl.DateTimeFormat("es-PE", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(seleccionada)
    : "";
  const inicialValor = seleccionada
    ? new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).format(seleccionada)
    : "Selecciona una fecha";

  useEffect(() => {
    if (!abierto) return undefined;
    const actualizarPosicion = () => {
      const boton = botonRef.current?.getBoundingClientRect();
      const calendario = calendarioRef.current;
      if (!boton || !calendario) return;

      const ancho = Math.min(288, window.innerWidth - 24);
      const left = Math.max(
        12,
        Math.min(boton.left, window.innerWidth - ancho - 12)
      );
      const espacioAbajo = Math.max(0, window.innerHeight - boton.bottom - 20);
      const espacioArriba = Math.max(0, boton.top - 20);
      const mostrarAbajo = espacioAbajo >= espacioArriba;
      const maxHeight = Math.max(
        150,
        Math.min(
          calendario.scrollHeight,
          mostrarAbajo ? espacioAbajo : espacioArriba
        )
      );
      const top = mostrarAbajo
        ? boton.bottom + 8
        : Math.max(12, boton.top - maxHeight - 8);

      setPosicionCalendario({ top, left, width: ancho, maxHeight });
    };

    const seleccionInicial = value || min || hoy;
    const frame = requestAnimationFrame(() => {
      actualizarPosicion();
      contenedorRef.current
        ?.querySelector(`[data-fecha="${seleccionInicial}"]`)
        ?.focus();
    });
    window.addEventListener("resize", actualizarPosicion);
    window.addEventListener("scroll", actualizarPosicion, true);
    const cerrarAlHacerClicFuera = (event) => {
      if (
        !contenedorRef.current?.contains(event.target) &&
        !calendarioRef.current?.contains(event.target)
      ) {
        setAbierto(false);
      }
    };
    document.addEventListener("pointerdown", cerrarAlHacerClicFuera);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", actualizarPosicion);
      window.removeEventListener("scroll", actualizarPosicion, true);
      document.removeEventListener("pointerdown", cerrarAlHacerClicFuera);
    };
  }, [abierto, hoy, min, value]);

  const cambiarValor = (nuevoValor) => {
    onChange?.({ target: { name, value: nuevoValor } });
  };

  const elegirFecha = (fecha) => {
    const valorISO = aISO(fecha);
    if ((min && valorISO < min) || (max && valorISO > max)) return;
    cambiarValor(valorISO);
    setMesVisible(new Date(fecha.getFullYear(), fecha.getMonth(), 1));
    setAbierto(false);
    requestAnimationFrame(() => botonRef.current?.focus());
  };

  const manejarTecladoCalendario = (event) => {
    const fechaActual = fechaDesdeISO(
      event.target instanceof HTMLElement
        ? event.target.dataset.fecha
        : undefined
    );
    if (!fechaActual) {
      if (event.key === "Escape") {
        setAbierto(false);
        botonRef.current?.focus();
      }
      return;
    }

    let diasMovimiento = 0;
    if (event.key === "ArrowRight") diasMovimiento = 1;
    if (event.key === "ArrowLeft") diasMovimiento = -1;
    if (event.key === "ArrowDown") diasMovimiento = 7;
    if (event.key === "ArrowUp") diasMovimiento = -7;
    if (event.key === "Home") diasMovimiento = -((fechaActual.getDay() + 6) % 7);
    if (event.key === "End") diasMovimiento = 6 - ((fechaActual.getDay() + 6) % 7);

    if (diasMovimiento) {
      event.preventDefault();
      const destino = new Date(fechaActual);
      destino.setDate(destino.getDate() + diasMovimiento);
      setMesVisible(new Date(destino.getFullYear(), destino.getMonth(), 1));
      requestAnimationFrame(() =>
        contenedorRef.current
          ?.querySelector(`[data-fecha="${aISO(destino)}"]`)
          ?.focus()
      );
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      const destino = new Date(
        fechaActual.getFullYear(),
        fechaActual.getMonth() + (event.key === "PageUp" ? -1 : 1),
        fechaActual.getDate()
      );
      setMesVisible(new Date(destino.getFullYear(), destino.getMonth(), 1));
      requestAnimationFrame(() =>
        contenedorRef.current
          ?.querySelector(`[data-fecha="${aISO(destino)}"]`)
          ?.focus()
      );
    } else if (event.key === "Escape") {
      event.preventDefault();
      setAbierto(false);
      botonRef.current?.focus();
    }
  };

  const manejarBlur = (event) => {
    const focoDentroDelSelector =
      contenedorRef.current?.contains(event.relatedTarget) ||
      calendarioRef.current?.contains(event.relatedTarget);
    if (!focoDentroDelSelector) {
      if (abierto) setAbierto(false);
      onBlur?.(event);
    }
  };

  return (
    <FieldWrapper
      id={inputId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      {({ describedBy, invalid }) => (
        <div ref={contenedorRef} onBlur={manejarBlur} className="relative">
          <button
            ref={botonRef}
            id={inputId}
            type="button"
            name={name}
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={abierto}
            aria-controls={calendarioId}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            aria-label={fechaLegible ? `Fecha seleccionada: ${fechaLegible}` : label}
            onClick={() => {
              if (!abierto && seleccionada) {
                setMesVisible(
                  new Date(seleccionada.getFullYear(), seleccionada.getMonth(), 1)
                );
              }
              setAbierto((actual) => !actual);
            }}
            className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3.5 text-left text-sm shadow-sm transition hover:border-brand-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:bg-slate-900 dark:disabled:bg-slate-800 ${
              invalid
                ? "border-red-400 dark:border-red-500"
                : "border-slate-300 dark:border-slate-700"
            }`}
          >
            <span className={`truncate ${seleccionada ? "font-medium text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}>
              {inicialValor}
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 shrink-0 text-brand-700 dark:text-brand-300"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 11h18" />
            </svg>
          </button>

          {abierto &&
            createPortal(
              <div
                ref={calendarioRef}
                id={calendarioId}
                role="dialog"
                aria-label="Seleccionar fecha"
                onKeyDown={manejarTecladoCalendario}
                style={{
                  position: "fixed",
                  top: posicionCalendario.top,
                  left: posicionCalendario.left,
                  width: posicionCalendario.width,
                  maxHeight: posicionCalendario.maxHeight
                }}
                className="z-[60] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:p-4"
              >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  aria-label="Mes anterior"
                  onClick={() => setMesVisible((mes) => ajustarMes(mes, -1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-300 dark:hover:bg-brand-950 dark:hover:text-brand-200"
                >
                  <MoverMesIcono anterior />
                </button>
                <p className="text-sm font-bold capitalize text-slate-900 dark:text-slate-100">
                  {etiquetaMes}
                </p>
                <button
                  type="button"
                  aria-label="Mes siguiente"
                  onClick={() => setMesVisible((mes) => ajustarMes(mes, 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-300 dark:hover:bg-brand-950 dark:hover:text-brand-200"
                >
                  <MoverMesIcono />
                </button>
              </div>

              <div className="mt-2 grid grid-cols-7 justify-items-center">
                {NOMBRES_DIAS.map((dia, indice) => (
                  <span
                    key={`${dia}-${indice}`}
                    aria-hidden="true"
                    className="flex h-8 w-9 items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-400"
                  >
                    {dia}
                  </span>
                ))}
                {dias.map((fecha) => {
                  const valorISO = aISO(fecha);
                  const fueraDelRango =
                    (min && valorISO < min) || (max && valorISO > max);
                  const esOtroMes = fecha.getMonth() !== mesVisible.getMonth();
                  const esSeleccionada = valorISO === value;
                  const esHoy = valorISO === hoy;

                  return (
                    <button
                      key={valorISO}
                      type="button"
                      data-fecha={valorISO}
                      disabled={Boolean(fueraDelRango)}
                      aria-label={new Intl.DateTimeFormat("es-PE", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      }).format(fecha)}
                      aria-current={esHoy ? "date" : undefined}
                      aria-pressed={esSeleccionada}
                      onClick={() => elegirFecha(fecha)}
                      className={`${CLASE_DIA} ${
                        esSeleccionada
                          ? "bg-brand-700 font-bold text-white hover:bg-brand-800 hover:text-white dark:bg-brand-600 dark:hover:bg-brand-500"
                          : esHoy
                          ? "font-bold text-brand-700 ring-1 ring-brand-300 dark:text-brand-300 dark:ring-brand-700"
                          : esOtroMes
                          ? "text-slate-400 dark:text-slate-600"
                          : "text-slate-700 dark:text-slate-200"
                      } disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit`}
                    >
                      {fecha.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => elegirFecha(new Date())}
                  disabled={(min && hoy < min) || (max && hoy > max)}
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-brand-300 dark:hover:bg-brand-950"
                >
                  Hoy
                </button>
                {!required && value && (
                  <button
                    type="button"
                    onClick={() => {
                      cambiarValor("");
                      setAbierto(false);
                      requestAnimationFrame(() => botonRef.current?.focus());
                    }}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Limpiar fecha
                  </button>
                )}
              </div>
                <p className="sr-only">
                  Usa las flechas para cambiar de día, Page Up o Page Down para
                  cambiar de mes y Escape para cerrar.
                </p>
              </div>,
              document.body
            )}
        </div>
      )}
    </FieldWrapper>
  );
}
