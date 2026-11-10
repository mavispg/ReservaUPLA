import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FieldWrapper from "./FieldWrapper.jsx";

const CONTROL_BASE =
  "flex h-11 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 text-left text-sm shadow-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-700 dark:disabled:text-slate-400";

const MENU_BASE =
  "z-[100] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/40";

function crearEvento(valor, name) {
  return { target: { value: valor, name } };
}

export default function SelectInput({
  id,
  label,
  options = [],
  placeholder = "Selecciona una opción",
  error = "",
  hint = "",
  required = false,
  className = "",
  value = "",
  onChange,
  onBlur,
  name,
  disabled = false,
  ...props
}) {
  const autoId = useId().replace(/:/g, "");
  const inputId = id ?? `select-${autoId}`;
  const listboxId = `${inputId}-options`;
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const optionRefs = useRef([]);
  const onBlurRef = useRef(onBlur);
  const selectedValueRef = useRef("");
  const nameRef = useRef(name);
  const [abierto, setAbierto] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const [portalTarget, setPortalTarget] = useState(null);

  const opcionesNormalizadas = options.map((opcion) =>
    typeof opcion === "string"
      ? { value: opcion, label: opcion }
      : opcion
  );
  const valorSeleccionado = value == null ? "" : String(value);
  const indiceSeleccionado = opcionesNormalizadas.findIndex(
    (opcion) => String(opcion.value) === valorSeleccionado
  );
  const opcionSeleccionada = opcionesNormalizadas[indiceSeleccionado];

  useEffect(() => {
    onBlurRef.current = onBlur;
    selectedValueRef.current = valorSeleccionado;
    nameRef.current = name;
  }, [onBlur, valorSeleccionado, name]);

  const cerrar = (notificarBlur = false) => {
    setAbierto(false);
    setPortalTarget(null);
    if (notificarBlur) {
      onBlurRef.current?.(
        crearEvento(selectedValueRef.current, nameRef.current)
      );
    }
  };

  const abrir = (indice = indiceSeleccionado) => {
    if (disabled) return;
    setPortalTarget(buttonRef.current?.closest('[role="dialog"]') ?? document.body);
    setAbierto(true);
    requestAnimationFrame(() => {
      const indiceEnfocable =
        indice >= 0 && !opcionesNormalizadas[indice]?.disabled
          ? indice
          : opcionesNormalizadas.findIndex((opcion) => !opcion.disabled);
      optionRefs.current[indiceEnfocable]?.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    if (!abierto) return undefined;

    const actualizarPosicion = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const espacioAbajo = window.innerHeight - rect.bottom;
      const mostrarArriba = espacioAbajo < 240 && rect.top > espacioAbajo;
      const altoMaximo = Math.max(
        120,
        Math.min(320, (mostrarArriba ? rect.top : espacioAbajo) - 12)
      );
      setMenuStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        maxHeight: altoMaximo,
        ...(mostrarArriba
          ? { bottom: window.innerHeight - rect.top + 6 }
          : { top: rect.bottom + 6 })
      });
    };

    const manejarClicExterno = (event) => {
      if (
        !rootRef.current?.contains(event.target) &&
        !document.getElementById(listboxId)?.contains(event.target)
      ) {
        cerrar(true);
      }
    };

    actualizarPosicion();
    window.addEventListener("resize", actualizarPosicion);
    window.addEventListener("scroll", actualizarPosicion, true);
    document.addEventListener("pointerdown", manejarClicExterno);
    return () => {
      window.removeEventListener("resize", actualizarPosicion);
      window.removeEventListener("scroll", actualizarPosicion, true);
      document.removeEventListener("pointerdown", manejarClicExterno);
    };
  }, [abierto, listboxId]);

  const seleccionar = (opcion) => {
    if (opcion.disabled) return;
    onChange?.(crearEvento(String(opcion.value), name));
    setAbierto(false);
    setPortalTarget(null);
    onBlur?.(crearEvento(String(opcion.value), name));
    buttonRef.current?.focus({ preventScroll: true });
  };

  const manejarTecladoBoton = (event) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      abrir(indiceSeleccionado);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      abrir(indiceSeleccionado >= 0 ? indiceSeleccionado : opcionesNormalizadas.length - 1);
    }
  };

  const manejarTecladoOpcion = (event, indice) => {
    let siguiente = indice;
    if (event.key === "ArrowDown") siguiente = indice + 1;
    else if (event.key === "ArrowUp") siguiente = indice - 1;
    else if (event.key === "Home") siguiente = 0;
    else if (event.key === "End") siguiente = opcionesNormalizadas.length - 1;
    else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cerrar();
      buttonRef.current?.focus({ preventScroll: true });
      return;
    } else if (event.key === "Tab") {
      cerrar(true);
      buttonRef.current?.focus({ preventScroll: true });
      return;
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      seleccionar(opcionesNormalizadas[indice]);
      return;
    } else {
      return;
    }

    event.preventDefault();
    while (
      siguiente >= 0 &&
      siguiente < opcionesNormalizadas.length &&
      opcionesNormalizadas[siguiente].disabled
    ) {
      siguiente += event.key === "ArrowUp" ? -1 : 1;
    }
    if (siguiente >= 0 && siguiente < opcionesNormalizadas.length) {
      optionRefs.current[siguiente]?.focus({ preventScroll: true });
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
        <div ref={rootRef}>
          <button
            {...props}
            ref={buttonRef}
            id={inputId}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={abierto}
            aria-controls={abierto ? listboxId : undefined}
            aria-required={required || undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            disabled={disabled}
            onClick={() => (abierto ? cerrar() : abrir())}
            onKeyDown={manejarTecladoBoton}
            className={`${CONTROL_BASE} ${
              invalid
                ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:focus:border-red-400 dark:focus:ring-red-950/50"
                : "border-slate-300 hover:border-brand-400 focus:border-brand-500 focus:ring-brand-200 dark:border-slate-600 dark:hover:border-brand-400 dark:focus:ring-brand-900/50"
            }`}
          >
            <span className={opcionSeleccionada ? "" : "text-slate-500 dark:text-slate-400"}>
              {opcionSeleccionada?.label ?? placeholder}
            </span>
            <svg
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 text-brand-600 transition-transform dark:text-brand-400 ${
                abierto ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.09 1.03l-4.25 4.5a.75.75 0 0 1-1.09 0l-4.25-4.5a.75.75 0 0 1 .02-1.05Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {name && <input type="hidden" name={name} value={valorSeleccionado} />}
          {abierto &&
            createPortal(
              <div
                id={listboxId}
                role="listbox"
                aria-label={label}
                className={MENU_BASE}
                style={menuStyle}
              >
                {opcionesNormalizadas.map((opcion, indice) => {
                  const seleccionada = String(opcion.value) === valorSeleccionado;
                  return (
                    <button
                      key={opcion.value}
                      ref={(elemento) => {
                        optionRefs.current[indice] = elemento;
                      }}
                      type="button"
                      role="option"
                      aria-selected={seleccionada}
                      disabled={opcion.disabled}
                      tabIndex={-1}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => seleccionar(opcion)}
                      onKeyDown={(event) => manejarTecladoOpcion(event, indice)}
                      className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                        opcion.disabled
                          ? "cursor-not-allowed text-slate-400 dark:text-slate-500"
                          : seleccionada
                          ? "bg-brand-50 font-semibold text-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
                          : "text-slate-700 hover:bg-brand-50 hover:text-brand-800 focus:bg-brand-50 focus:text-brand-800 dark:text-slate-200 dark:hover:bg-brand-900/40 dark:hover:text-brand-100 dark:focus:bg-brand-900/40 dark:focus:text-brand-100"
                      }`}
                    >
                      <span>{opcion.label}</span>
                      {seleccionada && (
                        <svg
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.31a1 1 0 0 1-1.42 0l-3.25-3.28a1 1 0 0 1 1.42-1.41l2.54 2.56 6.54-6.59a1 1 0 0 1 1.414-.004Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>,
              portalTarget ?? document.body
            )}
        </div>
      )}
    </FieldWrapper>
  );
}
