import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button.jsx";
import SelectInput from "./SelectInput.jsx";
import TextInput from "./TextInput.jsx";
import AlertMessage from "./AlertMessage.jsx";
import useDialogAccessibility from "../hooks/useDialogAccessibility.js";
import { ROLES_OPCIONES } from "../constants/roles.js";
import { normalizeText } from "../utils/normalizeText.js";
import PasswordRequirements from "./PasswordRequirements.jsx";
import { obtenerErrorPassword } from "../utils/validation.js";

/**
 * Modal accesible para editar los datos de un usuario (Nielsen 3 y 5).
 * Permite cambiar nombre, rol, estado y opcionalmente redefinir contraseña.
 */
export default function ModalEditarUsuario({
  abierto,
  usuario,
  onGuardar,
  onCerrar,
  guardando = false
}) {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [rol, setRol] = useState("");
  const [activo, setActivo] = useState(true);
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const dialogRef = useDialogAccessibility({
    abierto,
    onCerrar,
    bloqueado: guardando
  });

  useEffect(() => {
    if (usuario) {
      setNombreCompleto(usuario.nombreCompleto || "");
      setRol(usuario.rol || "");
      setActivo(usuario.activo ?? true);
      setPassword("");
      setErrores({});
      setErrorGeneral("");
    }
  }, [usuario, abierto]);

  if (!abierto || !usuario) return null;

  const validar = () => {
    const nuevos = {};
    const nombre = normalizeText(nombreCompleto);

    if (nombre.length < 3) {
      nuevos.nombreCompleto = "El nombre completo debe tener al menos 3 caracteres.";
    } else if (nombre.length > 150) {
      nuevos.nombreCompleto = "El nombre completo no puede superar los 150 caracteres.";
    }

    if (!rol) {
      nuevos.rol = "Selecciona un rol válido.";
    }

    const errorPassword = obtenerErrorPassword(password, false);
    if (errorPassword) {
      nuevos.password = errorPassword;
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorGeneral("");

    if (!validar()) {
      setErrorGeneral("Revisa los campos marcados.");
      return;
    }

    try {
      await onGuardar({
        id: usuario.id,
        nombreCompleto: normalizeText(nombreCompleto),
        rol,
        activo,
        password: password.trim() || undefined
      });
    } catch (err) {
      setErrorGeneral(err?.message || "No se pudo actualizar el usuario.");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        aria-hidden="true"
        onClick={() => {
          if (!guardando) onCerrar();
        }}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-editar"
        tabIndex={-1}
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-700">
          <div>
            <h2 id="titulo-modal-editar" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Editar usuario
            </h2>
            <p className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
              {usuario.correo}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors hover:bg-red-100 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-red-950/50 dark:hover:text-red-300"
            aria-label="Cerrar modal"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {errorGeneral && (
          <div className="mt-4">
            <AlertMessage tipo="error">{errorGeneral}</AlertMessage>
          </div>
        )}

        <form onSubmit={manejarEnvio} className="mt-4 space-y-4" noValidate>
          <TextInput
            label="Nombre completo"
            value={nombreCompleto}
            onChange={(e) => {
              setNombreCompleto(e.target.value);
              setErrores((prev) => ({ ...prev, nombreCompleto: "" }));
            }}
            error={errores.nombreCompleto}
            maxLength={150}
            required
            disabled={guardando}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="Rol"
              options={ROLES_OPCIONES}
              value={rol}
              onChange={(e) => {
                setRol(e.target.value);
                setErrores((prev) => ({ ...prev, rol: "" }));
              }}
              error={errores.rol}
              required
              disabled={guardando}
            />

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Estado de la cuenta
              </label>
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  id="checkbox-activo"
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  disabled={guardando}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700"
                />
                <label
                  htmlFor="checkbox-activo"
                  className="text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {activo ? "Usuario Activo (Permite acceso)" : "Usuario Inactivo (Bloqueado)"}
                </label>
              </div>
            </div>
          </div>

          <div>
            <TextInput
              label="Contraseña (opcional)"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrores((prev) => ({ ...prev, password: "" }));
              }}
              error={errores.password}
              placeholder="••••••••"
              maxLength={100}
              hint="Déjala vacía para conservar la contraseña actual."
              autoComplete="new-password"
              disabled={guardando}
            />
            {password && <PasswordRequirements password={password} />}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onCerrar}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={guardando}
              loadingText="Guardando cambios..."
            >
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
