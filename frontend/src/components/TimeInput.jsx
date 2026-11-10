import { useEffect, useId, useRef, useState } from "react";
import FieldWrapper from "./FieldWrapper.jsx";

function separarHora(valor) {
  if (!valor || !/^\d{2}:\d{2}$/.test(valor)) {
    return { hora: "", minuto: "" };
  }

  const [hora, minuto] = valor.split(":");
  return { hora, minuto };
}

function normalizarHora(hora, minuto) {
  if (!/^\d{2}$/.test(hora) || !/^\d{2}$/.test(minuto)) return "";

  return `${hora}:${minuto}`;
}

const CLASE_NUMERO =
  "h-8 min-w-0 flex-1 rounded-lg border-0 bg-slate-100 px-1 text-center text-base font-semibold tabular-nums text-slate-900 placeholder:text-slate-400 transition focus:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-brand-950 disabled:cursor-not-allowed disabled:opacity-50";

export default function TimeInput({
  id,
  label,
  error = "",
  hint = "",
  required = false,
  className = "",
  value = "",
  onChange,
  onBlur,
  disabled = false,
  name
}) {
  const autoId = useId().replace(/:/g, "");
  const inputId = id ?? `hora-${autoId}`;
  const ultimaEmisionRef = useRef(value);
  const [borrador, setBorrador] = useState(() => separarHora(value));

  useEffect(() => {
    if (value !== ultimaEmisionRef.current) {
      ultimaEmisionRef.current = value;
      setBorrador(separarHora(value));
    }
  }, [value]);

  const actualizarCampo = (campo, entrada) => {
    const digitos = entrada.replace(/\D/g, "").slice(0, 2);
    const siguiente = { ...borrador, [campo]: digitos };
    const valorNormalizado = normalizarHora(siguiente.hora, siguiente.minuto);

    setBorrador(siguiente);
    ultimaEmisionRef.current = valorNormalizado;
    onChange?.({ target: { name, value: valorNormalizado } });
  };

  const manejarBlurContenedor = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      onBlur?.(event);
    }
  };

  return (
    <FieldWrapper
      id={inputId}
      label={label}
      error={error}
      hint={
        hint ||
        "Digita la hora en formato de 24 horas (HH:MM), por ejemplo 13:30."
      }
      required={required}
      className={className}
    >
      {({ describedBy, invalid }) => (
        <div
          onBlur={manejarBlurContenedor}
          className={`flex h-11 min-h-11 w-full min-w-0 items-center gap-1 rounded-lg border bg-white px-2 shadow-sm transition focus-within:ring-2 dark:bg-slate-900 sm:gap-1.5 sm:px-3 ${
            invalid
              ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-200 dark:border-red-500 dark:focus-within:border-red-400 dark:focus-within:ring-red-950/50"
              : "border-slate-300 focus-within:border-brand-500 focus-within:ring-brand-200 dark:border-slate-700"
          } ${disabled ? "cursor-not-allowed bg-slate-100 dark:bg-slate-800" : ""}`}
        >
          <label className="sr-only" htmlFor={inputId}>
            {label}: hora, de 00 a 23
          </label>
          <input
            id={inputId}
            name={`${name || inputId}-hora`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="00"
            maxLength={2}
            value={borrador.hora}
            disabled={disabled}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            onChange={(event) => actualizarCampo("hora", event.target.value)}
            className={CLASE_NUMERO}
          />

          <span
            aria-hidden="true"
            className="text-base font-bold text-slate-500 dark:text-slate-400"
          >
            :
          </span>

          <label className="sr-only" htmlFor={`${inputId}-minutos`}>
            {label}: minutos, de 00 a 59
          </label>
          <input
            id={`${inputId}-minutos`}
            name={`${name || inputId}-minutos`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="00"
            maxLength={2}
            value={borrador.minuto}
            disabled={disabled}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            onChange={(event) => actualizarCampo("minuto", event.target.value)}
            className={CLASE_NUMERO}
          />
        </div>
      )}
    </FieldWrapper>
  );
}
