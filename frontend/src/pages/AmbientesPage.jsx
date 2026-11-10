import { useCallback, useEffect, useMemo, useState } from "react";
import AlertMessage from "../components/AlertMessage.jsx";
import Button from "../components/Button.jsx";
import ModalConfirmacion from "../components/ModalConfirmacion.jsx";
import ModalEditarAmbiente from "../components/ModalEditarAmbiente.jsx";
import SelectInput from "../components/SelectInput.jsx";
import TableList from "../components/TableList.jsx";
import TextInput from "../components/TextInput.jsx";
import {
  ESTADOS_AMBIENTE,
  TIPOS_AMBIENTE_OPCIONES
} from "../constants/ambientes.js";
import { ROLES_VEN_AMBIENTES } from "../constants/roles.js";
import { useUsuarioActual } from "../context/useUsuarioActual.js";
import { ambienteService } from "../services/ambienteService.js";
import { extraerErroresCampo, obtenerMensajeError } from "../utils/apiErrors.js";
import { normalizeText } from "../utils/normalizeText.js";
import { validarCampoAmbiente } from "../utils/validation.js";

const FORMULARIO_INICIAL = {
  nombre: "",
  tipo: "",
  capacidad: "",
  ubicacion: ""
};

const MAPA_ERRORES = {
  nombre: "Nombre",
  tipo: "Tipo",
  capacidad: "Capacidad",
  ubicacion: "Ubicacion"
};

const ESTILOS_ESTADO = {
  [ESTADOS_AMBIENTE.ACTIVO]:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-950/50 dark:text-emerald-300",
  [ESTADOS_AMBIENTE.INACTIVO]:
    "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  [ESTADOS_AMBIENTE.MANTENIMIENTO]:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/50 dark:text-amber-300"
};

function BadgeEstadoAmbiente({ estado }) {
  const estilo =
    ESTILOS_ESTADO[estado] ??
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${estilo}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {estado}
    </span>
  );
}

export default function AmbientesPage() {
  const { rolActual, esAdministrador } = useUsuarioActual();

  const [ambientes, setAmbientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Estados para Edición y Acciones sobre Ambientes
  const [ambienteParaEditar, setAmbienteParaEditar] = useState(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const [ambienteParaAccion, setAmbienteParaAccion] = useState(null);
  const [tipoAccion, setTipoAccion] = useState(null); // 'mantenimiento' | 'activar' | 'eliminar'
  const [ejecutandoAccion, setEjecutandoAccion] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");

  const cargar = useCallback(async () => {
    try {
      const lista = await ambienteService.listar();
      setAmbientes(lista);
      setError("");
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudieron cargar los ambientes.")
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const reintentar = () => {
    setCargando(true);
    setError("");
    cargar();
  };

  const puedeVer = ROLES_VEN_AMBIENTES.includes(rolActual);
  const puedeCrear = esAdministrador;

  const actualizarCampo = (campo) => (event) => {
    const valor = event.target.value;
    setFormulario((previo) => ({ ...previo, [campo]: valor }));

    if (errores[campo]) {
      const errorInmediato = validarCampoAmbiente(campo, valor);
      setErrores((previos) => ({ ...previos, [campo]: errorInmediato }));
    }
  };

  const manejarBlur = (campo) => () => {
    const errorCampo = validarCampoAmbiente(campo, formulario[campo]);
    setErrores((previos) => ({ ...previos, [campo]: errorCampo }));
  };

  const validar = () => {
    const campos = ["nombre", "tipo", "capacidad", "ubicacion"];
    const nuevos = {};

    campos.forEach((campo) => {
      const err = validarCampoAmbiente(campo, formulario[campo]);
      if (err) nuevos[campo] = err;
    });

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const manejarEnvio = async (event) => {
    event.preventDefault();
    setMensajeExito("");
    setErrorGeneral("");

    if (!validar()) {
      setErrorGeneral("Revisa los campos marcados.");
      return;
    }

    setEnviando(true);

    try {
      const creado = await ambienteService.crear({
        nombre: normalizeText(formulario.nombre),
        tipo: formulario.tipo,
        capacidad: Number(formulario.capacidad),
        ubicacion: normalizeText(formulario.ubicacion)
      });

      setMensajeExito(
        `Ambiente ${creado?.nombre ?? ""} registrado correctamente.`
      );
      setFormulario(FORMULARIO_INICIAL);
      setErrores({});
      setCargando(true);
      await cargar();
    } catch (err) {
      const erroresCampos = extraerErroresCampo(err, MAPA_ERRORES);
      setErrores(erroresCampos);
      setErrorGeneral(
        Object.keys(erroresCampos).length > 0
          ? "Revisa los campos marcados."
          : obtenerMensajeError(err)
      );
    } finally {
      setEnviando(false);
    }
  };

  const manejarGuardarEdicion = async (datos) => {
    setGuardandoEdicion(true);
    setErrorAccion("");

    try {
      const actualizado = await ambienteService.actualizar(datos.id, datos);
      setMensajeExito(`Ambiente ${actualizado.nombre} actualizado correctamente.`);
      setAmbienteParaEditar(null);
      await cargar();
    } catch (err) {
      throw new Error(obtenerMensajeError(err, "No se pudo actualizar el ambiente."));
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const manejarConfirmarAccion = async () => {
    if (!ambienteParaAccion || !tipoAccion) return;

    setEjecutandoAccion(true);
    setErrorAccion("");

    try {
      if (tipoAccion === "mantenimiento") {
        await ambienteService.cambiarEstado(ambienteParaAccion.id, ESTADOS_AMBIENTE.MANTENIMIENTO);
        setMensajeExito(`Ambiente ${ambienteParaAccion.nombre} puesto en mantenimiento.`);
      } else if (tipoAccion === "activar") {
        await ambienteService.cambiarEstado(ambienteParaAccion.id, ESTADOS_AMBIENTE.ACTIVO);
        setMensajeExito(`Ambiente ${ambienteParaAccion.nombre} reactivado correctamente.`);
      } else if (tipoAccion === "eliminar") {
        const res = await ambienteService.eliminar(ambienteParaAccion.id);
        setMensajeExito(res?.message || "Acción completada correctamente.");
      }

      setAmbienteParaAccion(null);
      setTipoAccion(null);
      await cargar();
    } catch (err) {
      setErrorAccion(obtenerMensajeError(err, "No se pudo completar la acción."));
    } finally {
      setEjecutandoAccion(false);
    }
  };

  const columnas = useMemo(() => {
    const cols = [
      { clave: "nombre", encabezado: "Nombre" },
      { clave: "tipo", encabezado: "Tipo" },
      {
        clave: "capacidad",
        encabezado: "Capacidad",
        alineacion: "right",
        render: (ambiente) => `${ambiente.capacidad} personas`
      },
      { clave: "ubicacion", encabezado: "Ubicación" },
      {
        clave: "estado",
        encabezado: "Estado",
        render: (ambiente) => <BadgeEstadoAmbiente estado={ambiente.estado} />
      }
    ];

    if (puedeCrear) {
      cols.push({
        clave: "acciones",
        encabezado: "Acciones",
        alineacion: "right",
        render: (a) => (
          <div className="flex items-center justify-end gap-1">
            {/* Botón Editar con Ícono */}
            <button
              type="button"
              onClick={() => setAmbienteParaEditar(a)}
              title="Editar información del ambiente"
              aria-label={`Editar ${a.nombre}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-400 dark:hover:bg-brand-950/50 dark:hover:text-brand-300"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>

            {/* Botón Alternar Estado (Mantenimiento / Activar) */}
            <button
              type="button"
              onClick={() => {
                setAmbienteParaAccion(a);
                setTipoAccion(a.estado === ESTADOS_AMBIENTE.ACTIVO ? "mantenimiento" : "activar");
              }}
              title={
                a.estado === ESTADOS_AMBIENTE.ACTIVO
                  ? "Poner en mantenimiento (suspender reservas)"
                  : "Reactivar disponibilidad para reservas"
              }
              aria-label={
                a.estado === ESTADOS_AMBIENTE.ACTIVO
                  ? `Poner en mantenimiento ${a.nombre}`
                  : `Reactivar ${a.nombre}`
              }
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 ${
                a.estado === ESTADOS_AMBIENTE.ACTIVO
                  ? "text-slate-500 hover:bg-amber-50 hover:text-amber-600 focus-visible:ring-amber-500 dark:text-slate-400 dark:hover:bg-amber-950/50 dark:hover:text-amber-300"
                  : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 focus-visible:ring-emerald-500 dark:text-slate-400 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300"
              }`}
            >
              {a.estado === ESTADOS_AMBIENTE.ACTIVO ? (
                // Ícono de herramienta / mantenimiento
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              ) : (
                // Ícono de check reactivar
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
            </button>

            {/* Botón Eliminar con Ícono de Papelera */}
            <button
              type="button"
              onClick={() => {
                setAmbienteParaAccion(a);
                setTipoAccion("eliminar");
              }}
              title="Eliminar ambiente (o inactivar si tiene reservas)"
              aria-label={`Eliminar ${a.nombre}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-slate-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        )
      });
    }

    return cols;
  }, [puedeCrear]);

  return (
    <section aria-labelledby="titulo-ambientes">
      <h1 id="titulo-ambientes" className="page-title">
        Ambientes
      </h1>
      <p className="page-subtitle">
        Consulta y gestiona los laboratorios, auditorios y salas disponibles para
        reservas institucionales.
      </p>

      {!puedeVer ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
        >
          Inicia sesión con un usuario Administrador o Responsable de ambiente para
          ver la gestión de ambientes.
        </div>
      ) : (
        <>
          {mensajeExito && (
            <AlertMessage
              tipo="success"
              titulo="Operación exitosa"
              className="mt-6"
              onClose={() => setMensajeExito("")}
            >
              {mensajeExito}
            </AlertMessage>
          )}

          {errorAccion && (
            <AlertMessage
              tipo="error"
              titulo="No se pudo completar la acción"
              className="mt-6"
              onClose={() => setErrorAccion("")}
            >
              {errorAccion}
            </AlertMessage>
          )}

          {!puedeCrear && (
            <AlertMessage tipo="info" titulo="Modo solo lectura" className="mt-6">
              Como Responsable de ambiente puedes consultar los ambientes, pero
              solo un administrador puede registrarlos o modificarlos.
            </AlertMessage>
          )}

          {error && (
            <AlertMessage
              tipo="error"
              titulo="No se pudieron cargar los ambientes"
              className="mt-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span>{error}</span>
                <Button variant="secondary" size="sm" onClick={reintentar}>
                  Reintentar
                </Button>
              </div>
            </AlertMessage>
          )}

          {puedeCrear && !error && (
            <div className="card mt-6 p-5">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Registrar ambiente
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                El ambiente queda en estado Activo al registrarse.
              </p>

              <form
                className="mt-5 grid gap-4 md:grid-cols-2"
                onSubmit={manejarEnvio}
                noValidate
              >
                <TextInput
                  label="Nombre del ambiente"
                  value={formulario.nombre}
                  onChange={actualizarCampo("nombre")}
                  onBlur={manejarBlur("nombre")}
                  error={errores.nombre}
                  placeholder="Ejemplo: Laboratorio A"
                  maxLength={100}
                  required
                  disabled={enviando}
                />

                <SelectInput
                  label="Tipo de ambiente"
                  options={TIPOS_AMBIENTE_OPCIONES}
                  value={formulario.tipo}
                  onChange={actualizarCampo("tipo")}
                  onBlur={manejarBlur("tipo")}
                  error={errores.tipo}
                  placeholder="Selecciona el tipo"
                  required
                  disabled={enviando}
                />

                <TextInput
                  label="Capacidad (aforo)"
                  type="number"
                  min="1"
                  max="5000"
                  step="1"
                  inputMode="numeric"
                  value={formulario.capacidad}
                  onChange={actualizarCampo("capacidad")}
                  onBlur={manejarBlur("capacidad")}
                  error={errores.capacidad}
                  hint="Número de personas (1 a 5000)."
                  required
                  disabled={enviando}
                />

                <TextInput
                  label="Ubicación en el campus"
                  value={formulario.ubicacion}
                  onChange={actualizarCampo("ubicacion")}
                  onBlur={manejarBlur("ubicacion")}
                  error={errores.ubicacion}
                  placeholder="Ejemplo: Pabellón A - 2do piso"
                  maxLength={100}
                  required
                  disabled={enviando}
                />

                {errorGeneral && (
                  <div className="md:col-span-2">
                    <AlertMessage tipo="error">{errorGeneral}</AlertMessage>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 md:col-span-2">
                  <Button
                    type="submit"
                    loading={enviando}
                    loadingText="Registrando..."
                  >
                    Registrar ambiente
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setFormulario(FORMULARIO_INICIAL);
                      setErrores({});
                      setErrorGeneral("");
                    }}
                    disabled={enviando}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}

          {!error && (
            <TableList
              className="mt-8"
              titulo="Ambientes registrados"
              descripcion="Espacios disponibles para reservar."
              columnas={columnas}
              datos={ambientes}
              cargando={cargando}
              mensajeVacio="Aún no hay ambientes. Crea el primero."
            />
          )}

          {/* Modal accesible para editar ambiente */}
          <ModalEditarAmbiente
            abierto={Boolean(ambienteParaEditar)}
            ambiente={ambienteParaEditar}
            guardando={guardandoEdicion}
            onGuardar={manejarGuardarEdicion}
            onCerrar={() => setAmbienteParaEditar(null)}
          />

          {/* Modal de confirmación para estado o eliminación (Nielsen 5) */}
          <ModalConfirmacion
            abierto={Boolean(ambienteParaAccion && tipoAccion)}
            titulo={
              tipoAccion === "mantenimiento"
                ? "Poner en mantenimiento"
                : tipoAccion === "activar"
                ? "Reactivar ambiente"
                : "Eliminar ambiente"
            }
            mensaje={
              tipoAccion === "mantenimiento"
                ? `¿Deseas poner en mantenimiento a ${ambienteParaAccion?.nombre}? Mientras esté en mantenimiento, no se podrán solicitar nuevas reservas para este ambiente.`
                : tipoAccion === "activar"
                ? `¿Deseas reactivar a ${ambienteParaAccion?.nombre} para que esté disponible para solicitudes de reserva?`
                : `¿Deseas eliminar a ${ambienteParaAccion?.nombre}? Si ya tiene reservas registradas en el historial, el sistema protegerá la auditoría marcándolo como Inactivo en lugar de destruirlo.`
            }
            textoConfirmar={
              tipoAccion === "mantenimiento"
                ? "Poner en mantenimiento"
                : tipoAccion === "activar"
                ? "Reactivar"
                : "Eliminar"
            }
            textoCancelar="Cancelar"
            variante={tipoAccion === "activar" ? "primario" : "peligro"}
            cargando={ejecutandoAccion}
            onConfirmar={manejarConfirmarAccion}
            onCerrar={() => {
              setAmbienteParaAccion(null);
              setTipoAccion(null);
            }}
          />
        </>
      )}
    </section>
  );
}
