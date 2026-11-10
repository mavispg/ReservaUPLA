/**
 * Envoltorio común de los campos: etiqueta siempre visible, texto de ayuda,
 * mensaje de error asociado por id y asterisco de obligatorio.
 * Evita duplicar la accesibilidad en cada input (DRY).
 */
export default function FieldWrapper({
  id,
  label,
  error = "",
  hint = "",
  required = false,
  className = "",
  children
}) {
  const mostrarHint = Boolean(hint) && !error;
  const hintId = mostrarHint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-red-600 dark:text-red-400">
            *
          </span>
        )}
      </label>

      {children({ describedBy, invalid: Boolean(error) })}

      {mostrarHint && (
        <p id={hintId} className="mt-1.5 text-sm leading-5 text-slate-600 dark:text-slate-400">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-sm font-medium leading-5 text-red-700 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
