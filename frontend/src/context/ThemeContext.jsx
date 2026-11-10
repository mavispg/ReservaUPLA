import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {}
});

const CLAVE_TEMA = "reservaupla.tema";

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      // Prioridad 1: lo que ya tenga aplicado el elemento <html> por el script inicial
      if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
        return true;
      }
      const guardado = localStorage.getItem(CLAVE_TEMA);
      if (guardado !== null) {
        return guardado === "dark";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      try {
        localStorage.setItem(CLAVE_TEMA, "dark");
      } catch {}
    } else {
      root.classList.remove("dark");
      try {
        localStorage.setItem(CLAVE_TEMA, "light");
      } catch {}
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const proximo = !prev;
      const root = document.documentElement;
      if (proximo) {
        root.classList.add("dark");
        try {
          localStorage.setItem(CLAVE_TEMA, "dark");
        } catch {}
      } else {
        root.classList.remove("dark");
        try {
          localStorage.setItem(CLAVE_TEMA, "light");
        } catch {}
      }
      return proximo;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
