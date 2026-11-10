import { useEffect, useRef } from "react";

const SELECTOR_FOCABLE =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function useDialogAccessibility({
  abierto,
  onCerrar,
  bloqueado,
  enfocarPrimerCampo = true
}) {
  const dialogRef = useRef(null);
  const callbacksRef = useRef({ onCerrar, bloqueado });

  useEffect(() => {
    callbacksRef.current = { onCerrar, bloqueado };
  }, [onCerrar, bloqueado]);

  useEffect(() => {
    if (!abierto) return undefined;

    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const focoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const temporizador = window.setTimeout(() => {
      const destinoInicial = enfocarPrimerCampo
        ? dialog.querySelector(
            "form input:not([disabled]), form select:not([disabled]), form textarea:not([disabled])"
          ) ??
          dialog.querySelector(SELECTOR_FOCABLE) ??
          dialog
        : dialog;
      destinoInicial.focus();
    }, 0);

    const manejarTecla = (event) => {
      const estado = callbacksRef.current;

      if (event.key === "Escape" && !estado.bloqueado) {
        event.preventDefault();
        estado.onCerrar?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focables = [...dialog.querySelectorAll(SELECTOR_FOCABLE)];
      if (!focables.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const primero = focables[0];
      const ultimo = focables[focables.length - 1];

      if (document.activeElement === dialog) {
        event.preventDefault();
        (event.shiftKey ? ultimo : primero).focus();
      } else if (event.shiftKey && document.activeElement === primero) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primero.focus();
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener("keydown", manejarTecla);

    return () => {
      window.clearTimeout(temporizador);
      document.removeEventListener("keydown", manejarTecla);
      document.body.style.overflow = overflowAnterior;
      focoAnterior?.focus?.();
    };
  }, [abierto, enfocarPrimerCampo]);

  return dialogRef;
}
