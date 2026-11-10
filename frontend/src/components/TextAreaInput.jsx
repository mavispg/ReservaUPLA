import { useId } from "react";
import FieldWrapper from "./FieldWrapper.jsx";

const BASE =
  "block w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:placeholder:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400";

/** Textarea con la misma accesibilidad y estilos que los inputs. */
export default function TextAreaInput({
  id,
  label,
  error = "",
  hint = "",
  required = false,
  rows = 4,
  maxLength,
  value,
  className = "",
  ...props
}) {
  const autoId = useId().replace(/:/g, "");
  const inputId = id ?? `textarea-${autoId}`;
  const contadorId = maxLength ? `contador-${autoId}` : undefined;
  const longitudActual = typeof value === "string" ? value.length : 0;

  return (
    <FieldWrapper
      id={inputId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      {({ describedBy, invalid }) => {
        const descripcionCompleta = [describedBy, contadorId]
          .filter(Boolean)
          .join(" ");

        return (
          <div>
            <textarea
              {...props}
              id={inputId}
              rows={rows}
              value={value}
              maxLength={maxLength}
              required={required}
              aria-invalid={invalid || undefined}
              aria-describedby={descripcionCompleta || undefined}
              className={`${BASE} ${
                invalid
                  ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:focus:border-red-400 dark:focus:ring-red-950/50"
                  : "border-slate-300 focus:border-brand-500 focus:ring-brand-200"
              }`}
            />
            {maxLength && (
              <div
                id={contadorId}
                aria-live="polite"
                className="mt-1 text-right text-xs text-slate-500 dark:text-slate-400"
              >
                <span className={longitudActual >= maxLength ? "font-semibold text-amber-600 dark:text-amber-400" : ""}>
                  {longitudActual}
                </span>{" "}
                / {maxLength} caracteres
              </div>
            )}
          </div>
        );
      }}
    </FieldWrapper>
  );
}
