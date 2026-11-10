import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button.jsx";
import SelectInput from "./SelectInput.jsx";
import TextInput from "./TextInput.jsx";
import AlertMessage from "./AlertMessage.jsx";
import useDialogAccessibility from "../hooks/useDialogAccessibility.js";
import { ESTADOS_AMBIENTE_OPCIONES, TIPOS_AMBIENTE_OPCIONES } from "../constants/ambientes.js";
import { normalizeText } from "../utils/normalizeText.js";
import { esEnteroEnRango } from "../utils/validation.js";

/**
 * Modal accesible para editar los datos de un ambiente institucional (Nielsen 3 y 5).
 * Permite cambiar nombre, tipo, capacidad, ubicación y estado operativo.
 */
export default function ModalEditarAmbiente({
  abierto,
  ambiente,
  onGuardar,
  onCerrar,
  guardando = false
}) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [estado, setEstado] = useState("");
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const dialogRef = useDialogAccessibility({
    abierto,
    onCerrar,
    bloqueado: guardando
  });

  useEffect(() => {
    if (ambiente) {
      setNombre(ambiente.nombre || "");
      setTipo(ambiente.tipo || "");
      setCapacidad(String(ambiente.capacidad ?? ""));
      setUbicacion(ambiente.ubicacion || "");
      setEstado(ambiente.estado || "");
      setErrores({});
      setErrorGeneral("");
    }
  }, [ambiente, abierto]);

  if (!abierto || !ambiente) return null;

  const validar = () => {
    const nuevos = {};
    const nombreNorm = normalizeText(nombre);
    const ubicacionNorm = normalizeText(ubicacion);

    if (nombreNorm.length < 3) {
      nuevos.nombre = "El nombre del ambiente debe tener al menos 3 caracteres.";
    } else if (nombreNorm.length > 100) {
      nuevos.nombre = "El nombre del ambiente no puede superar los 100 caracteres.";
    }

    if (!tipo) {
      nuevos.tipo = "Selecciona un tipo de ambiente.";
    }

    if (!capacidad) {
      nuevos.capacidad = "Ingresa la capacidad (aforo).";
    } else if (!esEnteroEnRango(capacidad, 1, 5000)) {
      nuevos.capacidad = "La capacidad debe ser un número entero entre 1 y 5000.";
    }

    if (ubicacionNorm.length < 3) {
      nuevos.ubicacion = "La ubicación debe tener al menos 3 caracteres.";
    } else if (ubicacionNorm.length > 100) {
      nuevos.ubicacion = "La ubicación no puede superar los 100 caracteres.";
    }

    if (!estado) {
      nuevos.estado = "Selecciona el estado del ambiente.";
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
        id: ambiente.id,
        nombre: normalizeText(nombre),
        tipo,
        capacidad: parseInt(capacidad, 10),
        ubicacion: normalizeText(ubicacion),
        estado
      });
    } catch (err) {
      setErrorGeneral(err?.message || "No se pudo actualizar el ambiente.");
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
        aria-labelledby="titulo-modal-editar-ambiente"
        tabIndex={-1}
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-700">
          <div>
            <h2 id="titulo-modal-editar-ambiente" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Editar ambiente
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Modifica la información o el estado operativo del ambiente.
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
            label="Nombre del ambiente"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setErrores((prev) => ({ ...prev, nombre: "" }));
            }}
            error={errores.nombre}
            placeholder="Ejemplo: Laboratorio A"
            maxLength={100}
            required
            disabled={guardando}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="Tipo de ambiente"
              options={TIPOS_AMBIENTE_OPCIONES}
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                setErrores((prev) => ({ ...prev, tipo: "" }));
              }}
              error={errores.tipo}
              required
              disabled={guardando}
            />

            <TextInput
              label="Capacidad (aforo)"
              type="number"
              min="1"
              max="5000"
              value={capacidad}
              onChange={(e) => {
                setCapacidad(e.target.value);
                setErrores((prev) => ({ ...prev, capacidad: "" }));
              }}
              error={errores.capacidad}
              placeholder="Número de personas"
              required
              disabled={guardando}
            />
          </div>

          <TextInput
            label="Ubicación en el campus"
            value={ubicacion}
            onChange={(e) => {
              setUbicacion(e.target.value);
              setErrores((prev) => ({ ...prev, ubicacion: "" }));
            }}
            error={errores.ubicacion}
            placeholder="Ejemplo: Pabellón A - 2do piso"
            maxLength={100}
            required
            disabled={guardando}
          />

          <SelectInput
            label="Estado operativo"
            options={ESTADOS_AMBIENTE_OPCIONES}
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setErrores((prev) => ({ ...prev, estado: "" }));
            }}
            error={errores.estado}
            hint="Los ambientes inactivos o en mantenimiento no pueden ser reservados."
            required
            disabled={guardando}
          />

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
