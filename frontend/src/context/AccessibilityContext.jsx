import { createContext, useContext, useEffect, useState } from "react";

const AccessibilityContext = createContext(null);
const STORAGE_KEY = "reservaupla.accesibilidad";

function leerPreferencias() {
  try {
    const guardadas = localStorage.getItem(STORAGE_KEY);
    if (!guardadas) return { textoAmpliado: false, altoContraste: false };

    const preferencias = JSON.parse(guardadas);
    return {
      textoAmpliado: preferencias.textoAmpliado === true,
      altoContraste: preferencias.altoContraste === true
    };
  } catch {
    return { textoAmpliado: false, altoContraste: false };
  }
}

export function AccessibilityProvider({ children }) {
  const [preferencias, setPreferencias] = useState(leerPreferencias);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("texto-ampliado", preferencias.textoAmpliado);
    root.classList.toggle("alto-contraste", preferencias.altoContraste);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferencias));
    } catch {
      // La preferencia sigue activa durante esta sesión aunque no pueda guardarse.
    }
  }, [preferencias]);

  const actualizarPreferencia = (nombre, valor) => {
    setPreferencias((actuales) => ({ ...actuales, [nombre]: valor }));
  };

  const restablecerPreferencias = () => {
    setPreferencias({ textoAmpliado: false, altoContraste: false });
  };

  return (
    <AccessibilityContext.Provider
      value={{ ...preferencias, actualizarPreferencia, restablecerPreferencias }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useAccessibility() {
  const contexto = useContext(AccessibilityContext);
  if (!contexto) {
    throw new Error("useAccessibility debe usarse dentro de AccessibilityProvider.");
  }
  return contexto;
}
