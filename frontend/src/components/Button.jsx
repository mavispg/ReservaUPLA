import { forwardRef } from "react";
import Spinner from "./Spinner.jsx";

const VARIANTES = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand-500",
  secondary:
    "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500",
  ghost:
    "text-slate-700 shadow-none hover:bg-slate-100 focus-visible:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-800"
};

const TAMANOS = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base"
};

/**
 * Botón reutilizable con variantes, tamaño y estado de carga.
 * Nielsen 1: mientras se envía, el usuario ve "Registrando..." y no puede
 * pulsar dos veces (prevención de doble envío).
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    loading = false,
    loadingText = "Procesando...",
    fullWidth = false,
    className = "",
    type = "button",
    disabled = false,
    ...props
  },
  ref
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
        VARIANTES[variant] ?? VARIANTES.primary
      } ${TAMANOS[size] ?? TAMANOS.md} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {loading && <Spinner />}
      {loading ? loadingText : children}
    </button>
  );
});

export default Button;
