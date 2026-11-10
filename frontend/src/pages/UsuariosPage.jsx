import { useMemo, useState } from "react";
import AlertMessage from "../components/AlertMessage.jsx";
import Button from "../components/Button.jsx";
import ModalConfirmacion from "../components/ModalConfirmacion.jsx";
import ModalEditarUsuario from "../components/ModalEditarUsuario.jsx";
import PasswordRequirements from "../components/PasswordRequirements.jsx";
import SelectInput from "../components/SelectInput.jsx";
import TableList from "../components/TableList.jsx";
import TextInput from "../components/TextInput.jsx";
import { ROLES_OPCIONES } from "../constants/roles.js";
import { useUsuarioActual } from "../context/useUsuarioActual.js";
import { usuarioService } from "../services/usuarioService.js";
import { extraerErroresCampo, obtenerMensajeError } from "../utils/apiErrors.js";
import { normalizeEmail, normalizeText } from "../utils/normalizeText.js";
import { validarCampoUsuario } from "../utils/validation.js";

const FORMULARIO_INICIAL = {
  nombreCompleto: "",
  correo: "",
  rol: "",
  password: ""
};

const MAPA_ERRORES = {
  nombreCompleto: "NombreCompleto",
  correo: "Correo",
  rol: "Rol",
  password: "Password"
};

export default function UsuariosPage() {
  const {
    usuarios,
    usuariosActivos,
    usuarioActual,
    esAdministrador,
    cargando,
    error,
    recargarUsuarios,
    seleccionarUsuario
  } = useUsuarioActual();

  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Estados para Edición y Eliminación / Desactivación
  const [usuarioParaEditar, setUsuarioParaEditar] = useState(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const [usuarioParaAccion, setUsuarioParaAccion] = useState(null);
  const [tipoAccion, setTipoAccion] = useState(null); // 'estado' | 'eliminar'
  const [ejecutandoAccion, setEjecutandoAccion] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");

  const sinUsuarios = !cargando && !error && usuariosActivos.length === 0;
  const puedeGestionar = esAdministrador || sinUsuarios;

  const actualizarCampo = (campo) => (event) => {
    const valor = event.target.value;
    setFormulario((previo) => ({ ...previo, [campo]: valor }));

    if (errores[campo]) {
      const errorInmediato = validarCampoUsuario(campo, valor);
      setErrores((previos) => ({ ...previos, [campo]: errorInmediato }));
    }
  };

  const manejarBlur = (campo) => () => {
    const errorCampo = validarCampoUsuario(campo, formulario[campo]);
    setErrores((previos) => ({ ...previos, [campo]: errorCampo }));
  };

  const validar = () => {
    const campos = ["nombreCompleto", "correo", "rol", "password"];
    const nuevos = {};

    campos.forEach((campo) => {
      const err = validarCampoUsuario(campo, formulario[campo]);
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

    const eraPrimerUsuario = usuariosActivos.length === 0;
    setEnviando(true);

    try {
      const creado = await usuarioService.crear({
        nombreCompleto: normalizeText(formulario.nombreCompleto),
        correo: normalizeEmail(formulario.correo),
        rol: formulario.rol,
        password: formulario.password
      });

      setMensajeExito(
        `Usuario ${creado?.nombreCompleto ?? ""} registrado correctamente.`
      );
      setFormulario(FORMULARIO_INICIAL);
      setErrores({});

      if (eraPrimerUsuario && creado) {
        seleccionarUsuario(creado);
      }

      await recargarUsuarios();
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

  // Manejador para Guardar la Edición
  const manejarGuardarEdicion = async (datos) => {
    setGuardandoEdicion(true);
    setErrorAccion("");

    try {
      const actualizado = await usuarioService.actualizar(datos.id, datos);
      setMensajeExito(
        `Usuario ${actualizado?.nombreCompleto ?? ""} actualizado correctamente.`
      );
      setUsuarioParaEditar(null);
      await recargarUsuarios();
    } catch (err) {
      throw new Error(obtenerMensajeError(err, "No se pudo actualizar el usuario."));
    } finally {
      setGuardandoEdicion(false);
    }
  };

  // Manejador para Confirmar Desactivación/Activación o Eliminación
  const manejarConfirmarAccion = async () => {
    if (!usuarioParaAccion || !tipoAccion) return;

    setEjecutandoAccion(true);
    setErrorAccion("");

    try {
      if (tipoAccion === "estado") {
        const nuevoEstado = !usuarioParaAccion.activo;
        await usuarioService.cambiarEstado(usuarioParaAccion.id, nuevoEstado);
        setMensajeExito(
          nuevoEstado
            ? `Usuario ${usuarioParaAccion.nombreCompleto} activado correctamente.`
            : `Usuario ${usuarioParaAccion.nombreCompleto} desactivado correctamente.`
        );
      } else if (tipoAccion === "eliminar") {
        const res = await usuarioService.eliminar(usuarioParaAccion.id);
        setMensajeExito(res?.message || "Acción completada correctamente.");
      }

      setUsuarioParaAccion(null);
      setTipoAccion(null);
      await recargarUsuarios();
    } catch (err) {
      setErrorAccion(obtenerMensajeError(err, "No se pudo completar la acción."));
    } finally {
      setEjecutandoAccion(false);
    }
  };

  const columnas = useMemo(
    () => [
      { clave: "nombreCompleto", encabezado: "Nombre completo" },
      { clave: "correo", encabezado: "Correo" },
      { clave: "rol", encabezado: "Rol" },
      {
        clave: "activo",
        encabezado: "Estado",
        render: (usuario) => (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
              usuario.activo
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-950/50 dark:text-emerald-300"
                : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${
                usuario.activo ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {usuario.activo ? "Activo" : "Inactivo"}
          </span>
        )
      },
      {
        clave: "acciones",
        encabezado: "Acciones",
        alineacion: "right",
        render: (u) => {
          const esPropioUsuario = u.id === usuarioActual?.id;

          return (
            <div className="flex items-center justify-end gap-1">
              {/* Botón Editar con Ícono de Lápiz */}
              <button
                type="button"
                onClick={() => setUsuarioParaEditar(u)}
                title="Editar usuario"
                aria-label={`Editar a ${u.nombreCompleto}`}
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

              {/* Botón Activar / Desactivar con Ícono de Estado */}
              <button
                type="button"
                disabled={esPropioUsuario}
                title={
                  esPropioUsuario
                    ? "No puedes desactivar tu propia cuenta en sesión"
                    : u.activo
                    ? "Desactivar acceso (suspender cuenta)"
                    : "Activar acceso al sistema"
                }
                aria-label={
                  esPropioUsuario
                    ? "No puedes desactivar tu propia cuenta"
                    : u.activo
                    ? `Desactivar a ${u.nombreCompleto}`
                    : `Activar a ${u.nombreCompleto}`
                }
                onClick={() => {
                  setUsuarioParaAccion(u);
                  setTipoAccion("estado");
                }}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40 ${
                  u.activo
                    ? "text-slate-500 hover:bg-amber-50 hover:text-amber-600 focus-visible:ring-amber-500 dark:text-slate-400 dark:hover:bg-amber-950/50 dark:hover:text-amber-300"
                    : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 focus-visible:ring-emerald-500 dark:text-slate-400 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300"
                }`}
              >
                {u.activo ? (
                  // Ícono de suspensión / pausa
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
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                ) : (
                  // Ícono de reactivar / check
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
                disabled={esPropioUsuario}
                title={
                  esPropioUsuario
                    ? "No puedes eliminar tu propia cuenta en sesión"
                    : "Eliminar usuario (o desactivar si tiene historial)"
                }
                aria-label={
                  esPropioUsuario
                    ? "No puedes eliminar tu propia cuenta"
                    : `Eliminar a ${u.nombreCompleto}`
                }
                onClick={() => {
                  setUsuarioParaAccion(u);
                  setTipoAccion("eliminar");
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
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
          );
        }
      }
    ],
    [usuarioActual]
  );

  return (
    <section aria-labelledby="titulo-usuarios">
      <h1 id="titulo-usuarios" className="page-title">
        Usuarios
      </h1>
      <p className="page-subtitle">
        Gestiona y consulta a las personas que solicitan o administran
        reservas de ambientes institucionales.
      </p>

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

      {sinUsuarios && (
        <AlertMessage tipo="info" titulo="Configuración inicial" className="mt-6">
          No hay usuarios registrados. Crea el primer administrador para
          empezar a usar la aplicación.
        </AlertMessage>
      )}

      {error && (
        <AlertMessage
          tipo="error"
          titulo="No se pudieron cargar los usuarios"
          className="mt-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={recargarUsuarios}>
              Reintentar
            </Button>
          </div>
        </AlertMessage>
      )}

      {!error && puedeGestionar && (
        <div className="card mt-6 p-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {sinUsuarios ? "Crear el primer administrador" : "Registrar nuevo usuario"}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            El correo institucional debe ser único. El usuario queda activo al registrarse.
          </p>

          <form
            className="mt-5 grid gap-4 md:grid-cols-2"
            onSubmit={manejarEnvio}
            noValidate
          >
            <TextInput
              label="Nombre completo"
              value={formulario.nombreCompleto}
              onChange={actualizarCampo("nombreCompleto")}
              onBlur={manejarBlur("nombreCompleto")}
              error={errores.nombreCompleto}
              placeholder="Ejemplo: Ana Torres"
              maxLength={150}
              required
              disabled={enviando}
            />

            <TextInput
              label="Correo institucional (@upla.edu.pe)"
              type="email"
              value={formulario.correo}
              onChange={actualizarCampo("correo")}
              onBlur={manejarBlur("correo")}
              error={errores.correo}
              placeholder="usuario@upla.edu.pe"
              maxLength={150}
              autoComplete="email"
              required
              disabled={enviando}
            />

            <SelectInput
              label="Rol asignado"
              options={ROLES_OPCIONES}
              value={formulario.rol}
              onChange={actualizarCampo("rol")}
              onBlur={manejarBlur("rol")}
              error={errores.rol}
              placeholder="Selecciona un rol"
              required
              disabled={enviando}
            />

            <div>
              <TextInput
                label="Contraseña"
                type="password"
                value={formulario.password}
                onChange={actualizarCampo("password")}
                onBlur={manejarBlur("password")}
                error={errores.password}
                placeholder="••••••••"
                maxLength={100}
                autoComplete="new-password"
                required
                disabled={enviando}
              />
              <PasswordRequirements password={formulario.password} />
            </div>

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
                Registrar usuario
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

      {!puedeGestionar && !cargando && !error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
        >
          {usuarioActual
            ? "Solo un administrador activo puede gestionar usuarios."
            : "Inicia sesión con un usuario Administrador para gestionar usuarios."}
        </div>
      )}

      {puedeGestionar && !error && (
        <TableList
          className="mt-8"
          titulo="Usuarios registrados"
          descripcion="Todos los usuarios de la aplicación, activos e inactivos."
          columnas={columnas}
          datos={usuarios}
          cargando={cargando}
          mensajeVacio="Aún no hay usuarios. Crea el primero."
        />
      )}

      {/* Modal accesible para editar usuario */}
      <ModalEditarUsuario
        abierto={Boolean(usuarioParaEditar)}
        usuario={usuarioParaEditar}
        guardando={guardandoEdicion}
        onGuardar={manejarGuardarEdicion}
        onCerrar={() => setUsuarioParaEditar(null)}
      />

      {/* Modal de confirmación para Activar/Desactivar o Eliminar (Nielsen 5) */}
      <ModalConfirmacion
        abierto={Boolean(usuarioParaAccion && tipoAccion)}
        titulo={
          tipoAccion === "estado"
            ? (usuarioParaAccion?.activo ? "Desactivar usuario" : "Activar usuario")
            : "Eliminar usuario"
        }
        mensaje={
          tipoAccion === "estado"
            ? usuarioParaAccion?.activo
              ? `¿Seguro que deseas desactivar a ${usuarioParaAccion?.nombreCompleto}? El usuario no podrá iniciar sesión mientras esté inactivo.`
              : `¿Deseas reactivar el acceso al sistema para ${usuarioParaAccion?.nombreCompleto}?`
            : `¿Deseas eliminar a ${usuarioParaAccion?.nombreCompleto}? Si tiene reservas asociadas en el historial, el sistema protegerá la auditoría desactivando su cuenta en lugar de destruirla.`
        }
        textoConfirmar={
          tipoAccion === "estado"
            ? (usuarioParaAccion?.activo ? "Desactivar" : "Activar")
            : "Eliminar"
        }
        textoCancelar="Cancelar"
        variante={tipoAccion === "eliminar" || (tipoAccion === "estado" && usuarioParaAccion?.activo) ? "peligro" : "primario"}
        cargando={ejecutandoAccion}
        onConfirmar={manejarConfirmarAccion}
        onCerrar={() => {
          setUsuarioParaAccion(null);
          setTipoAccion(null);
        }}
      />
    </section>
  );
}
