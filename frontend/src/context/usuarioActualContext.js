import { createContext } from "react";

/**
 * Contexto interno del usuario actual. Se separa del Provider y del hook
 * para que Fast Refresh funcione sin advertencias.
 */
export const UsuarioActualContext = createContext(null);
