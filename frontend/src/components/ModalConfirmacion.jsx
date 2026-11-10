import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "./Button.jsx";

/**
 * Modal de confirmación accesible.
 * - Nielsen 5: el foco inicial va a "Cancelar" para evitar confirmaciones accidentales.
 * - Escape cierra, Tab queda atrapado dentro y al cerrar se restaura el foco.
 */
export default function ModalConfirmacion({
  abierto,
  titulo,
  mensaje = "",
  children,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  variante = "primario",
  cargando = false,
  onConfirmar,
  onCerrar
}) {
  const panelRef = useRef(null);
  const cancelarRef = useRef(null);
  const enfoquePrevio = useRef(null);
  const callbacksRef = useRef({ onCerrar, cargando });

  const idBase = useId().replace(/:/g, "");
  const tituloId = `modal-titulo-${idBase}`;
  const mensajeId = `modal-mensaje-${idBase}`;

  useEffect(() => {
    callbacksRef.current = { onCerrar, cargando };
  });

  useEffect(() => {
    if (!abierto) return undefined;

    enfoquePrevio.current = document.activeElement;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Se espera al render para enfocar el botón seguro.
    const temporizador = window.setTimeout(() => {
      cancelarRef.current?.focus();
    }, 0);

    const manejarTecla = (event) => {
      const estadoActual = callbacksRef.current;

      if (event.key === "Escape" && !estadoActual.cargando) {
        event.preventDefault();
        estadoActual.onCerrar?.();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusables.length === 0) return;

      const primero = focusables[0];
      const ultimo = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === primero) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener("keydown", manejarTecla);

    return () => {
      window.clearTimeout(temporizador);
      document.removeEventListener("keydown", manejarTecla);
      document.body.style.overflow = overflowPrevio;
      enfoquePrevio.current?.focus?.();
    };
  }, [abierto]);

  if (!abierto) return null;

  const esPeligro = variante === "peligro";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={() => {
          if (!cargando) onCerrar?.();
        }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={mensaje ? mensajeId : undefined}
        aria-busy={cargando || undefined}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              esPeligro
                ? "bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400"
                : "bg-brand-100 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300"
            }`}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              {esPeligro ? (
                <>
                  <path d="M12 3l9.5 17H2.5L12 3z" />
                  <path d="M12 9v5M12 17.5h.01" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5M12 8h.01" />
                </>
              )}
            </svg>
          </span>

          <div className="min-w-0">
            <h2 id={tituloId} className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {titulo}
            </h2>
            {mensaje && (
              <p
                id={mensajeId}
                className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
              >
                {mensaje}
              </p>
            )}
          </div>
        </div>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            ref={cancelarRef}
            variant="secondary"
            onClick={onCerrar}
            disabled={cargando}
          >
            {textoCancelar}
          </Button>
          <Button
            variant={esPeligro ? "danger" : "primary"}
            onClick={onConfirmar}
            loading={cargando}
            loadingText="Procesando..."
          >
            {textoConfirmar}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
