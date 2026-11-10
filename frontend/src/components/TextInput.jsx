import { useId } from "react";
import FieldWrapper from "./FieldWrapper.jsx";

const BASE =
  "block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500";

export default function TextInput({
  id,
  label,
  error = "",
  hint = "",
  required = false,
  type = "text",
  className = "",
  inputClassName = "",
  ...props
}) {
  const autoId = useId().replace(/:/g, "");
  const inputId = id ?? `texto-${autoId}`;

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
        <input
          {...props}
          id={inputId}
          type={type}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={`${BASE} ${inputClassName} ${
            invalid
              ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-950/50"
              : "border-slate-300 focus:border-brand-500 focus:ring-brand-200 dark:border-slate-700 dark:focus:border-brand-400 dark:focus:ring-brand-950/50"
          }`}
        />
      )}
    </FieldWrapper>
  );
}
