import { useContext } from "react";
import { UsuarioActualContext } from "./usuarioActualContext.js";

export function useUsuarioActual() {
  const contexto = useContext(UsuarioActualContext);

  if (!contexto) {
    throw new Error(
      "useUsuarioActual debe usarse dentro de UsuarioActualProvider."
    );
  }

  return contexto;
}
