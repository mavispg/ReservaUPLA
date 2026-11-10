import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AlertMessage from "../components/AlertMessage.jsx";
import Button from "../components/Button.jsx";
import TextInput from "../components/TextInput.jsx";
import Spinner from "../components/Spinner.jsx";
import { useUsuarioActual } from "../context/useUsuarioActual.js";
import { obtenerMensajeError } from "../utils/apiErrors.js";
import ThemeToggle from "../components/ThemeToggle.jsx";
import AccessibilityControls from "../components/AccessibilityControls.jsx";
import fondoLogin from "../assets/login-bg.jpg";
import logoIsotipo from "../assets/logo-isotipo-upla.png";

function Logo({ paraFondoOscuro = true }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={logoIsotipo}
        alt="Universidad Peruana Los Andes"
        className="h-11 w-11 shrink-0 object-contain drop-shadow-md"
      />
      <div>
        <p className={`text-3xl font-bold tracking-tight leading-tight ${paraFondoOscuro ? "text-white" : "text-slate-900 dark:text-white"}`}>
          ReservaUPLA
        </p>
        <p className={`text-sm font-medium ${paraFondoOscuro ? "text-brand-300" : "text-brand-700 dark:text-brand-300"}`}>
          Universidad Peruana Los Andes
        </p>
      </div>
    </div>
  );
}

const CORREO_ADMINISTRADOR = "admin@upla.edu.pe";
const ASUNTO_RECUPERACION = encodeURIComponent("Solicitud de restablecimiento de contraseña - ReservaUPLA");
const ENLACE_MAILTO_ADMINISTRADOR = `mailto:${CORREO_ADMINISTRADOR}?subject=${ASUNTO_RECUPERACION}`;
const ENLACE_GMAIL_ADMINISTRADOR =
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CORREO_ADMINISTRADOR)}` +
  `&su=${ASUNTO_RECUPERACION}`;

export default function LoginPage() {
  const { usuarioActual, cargando: cargandoSesion, iniciarSesion } = useUsuarioActual();
  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarAyudaPassword, setMostrarAyudaPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");
  const [erroresCampo, setErroresCampo] = useState({});

  const destino =
    location.state?.from && location.state.from !== "/login"
      ? location.state.from
      : "/dashboard";

  if (usuarioActual && !cargandoSesion) {
    return <Navigate to={destino} replace />;
  }

  const validar = () => {
    const nuevosErrores = {};
    const correoTrim = correo.trim();

    if (!correoTrim) {
      nuevosErrores.correo = "Ingresa tu correo institucional.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoTrim)) {
      nuevosErrores.correo = "Ingresa un correo electrónico con formato válido.";
    } else if (!correoTrim.toLowerCase().endsWith("@upla.edu.pe")) {
      nuevosErrores.correo = "El correo debe pertenecer al dominio institucional (@upla.edu.pe).";
    }

    if (!password) {
      nuevosErrores.password = "Ingresa tu contraseña.";
    } else if (password.length < 8) {
      nuevosErrores.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    setErroresCampo(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarSubmit = async (event) => {
    event.preventDefault();
    if (enviando) return;

    setErrorGeneral("");

    if (!validar()) {
      return;
    }

    setEnviando(true);

    try {
      await iniciarSesion(correo.trim(), password);
      navigate(destino, { replace: true });
    } catch (err) {
      if (err?.status === 401) {
        setErrorGeneral("Correo o contraseña incorrectos.");
      } else if (err?.status === 0) {
        setErrorGeneral("No se pudo conectar con el servidor backend (puerto 5153). Verifica que la API esté corriendo.");
      } else {
        setErrorGeneral(
          obtenerMensajeError(err, "Ocurrió un error al iniciar sesión. Intenta nuevamente.")
        );
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900">
      <a href="#contenido-login" className="skip-link">
        Saltar al inicio de sesión
      </a>
      <img
        src={fondoLogin}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-950/65"
      />

      <div className="relative z-10 grid min-h-screen w-full lg:grid-cols-12">
        <aside className="relative hidden min-h-screen flex-col justify-start overflow-hidden p-10 text-white lg:col-span-7 lg:flex lg:p-14 xl:col-span-8 xl:p-18">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/80 to-brand-900/60"
          />

          <div className="relative z-10">
            <Logo paraFondoOscuro={true} />
          </div>

          <div className="relative z-10 mt-10 max-w-2xl py-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-300 ring-1 ring-inset ring-brand-400/40">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Sistema Institucional de Gestión · UPLA
            </div>

            <h2 className="mt-5 text-4xl font-extrabold leading-tight text-white xl:text-5xl">
              Reserva ambientes universitarios.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200/90">
              Solicita y consulta auditorios, laboratorios y salas de la Universidad Peruana Los Andes.
            </p>

            <ul className="mt-8 grid max-w-xl gap-3">
              <li className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xs">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400">✓</span>
                <span className="text-sm leading-relaxed text-slate-200">
                  <strong className="text-white">Disponibilidad en tiempo real</strong>
                  <span className="mt-0.5 block text-slate-300">Horario de atención: 07:00 a 22:00.</span>
                </span>
              </li>
              <li className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xs">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400">✓</span>
                <span className="text-sm leading-relaxed text-slate-200">
                  <strong className="text-white">Ambientes institucionales</strong>
                  <span className="mt-0.5 block text-slate-300">Laboratorios, auditorios y salas universitarias.</span>
                </span>
              </li>
              <li className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xs">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400">✓</span>
                <span className="text-sm leading-relaxed text-slate-200">
                  <strong className="text-white">Seguimiento de solicitudes</strong>
                  <span className="mt-0.5 block text-slate-300">Consulta el estado de cada solicitud.</span>
                </span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Formulario de Acceso (Más compacto, centrado y estilizado) */}
        <main id="contenido-login" tabIndex={-1} className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-brand-50/80 px-6 py-10 transition-colors duration-200 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950/40 sm:px-10 lg:col-span-5 lg:px-8 xl:col-span-4 xl:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full bg-brand-300/25 blur-3xl dark:bg-brand-600/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-900/20"
          />
          <div className="relative z-10 mx-auto w-full max-w-md">
            <div className="mb-7 flex items-center justify-between">
              <div className="lg:hidden">
                <Logo paraFondoOscuro={false} />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <AccessibilityControls />
                <ThemeToggle />
              </div>
            </div>

            <section className="rounded-2xl border border-white/80 bg-white/75 p-6 shadow-xl shadow-brand-950/5 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-800/70 sm:p-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Iniciar sesión
                </h1>
                <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-300">
                  Ingresa con tu correo institucional y contraseña para continuar.
                </p>
              </div>

              {errorGeneral && (
                <AlertMessage
                  tipo="error"
                  titulo="Acceso denegado"
                  className="mt-5"
                >
                  {errorGeneral}
                </AlertMessage>
              )}

              <form className="mt-6 space-y-5" onSubmit={manejarSubmit} noValidate>
                <TextInput
                  label="Correo institucional"
                  type="email"
                  name="email"
                  autoComplete="username"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    setErroresCampo((prev) => ({ ...prev, correo: "" }));
                    setErrorGeneral("");
                  }}
                  error={erroresCampo.correo}
                  placeholder="ejemplo@upla.edu.pe"
                  disabled={enviando}
                  required
                  inputClassName="px-4 py-3 text-base"
                />

                <div className="relative">
                  <TextInput
                    label="Contraseña"
                    type={mostrarPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErroresCampo((prev) => ({ ...prev, password: "" }));
                      setErrorGeneral("");
                    }}
                    error={erroresCampo.password}
                    placeholder="Ingresa tu contraseña"
                    disabled={enviando}
                    required
                    inputClassName="px-4 py-3 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3.5 top-[39px] flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-400 dark:hover:bg-slate-700/60 dark:hover:text-slate-200"
                    aria-label={mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    title={mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {mostrarPassword ? (
                      // Ojo tachado (Ocultar)
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      // Ojo abierto (Mostrar)
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="pt-1">
                  <Button type="submit" size="lg" fullWidth disabled={enviando}>
                    {enviando ? (
                      <span className="flex items-center justify-center gap-2">
                        <Spinner className="h-4 w-4 text-white" />
                        Iniciando sesión...
                      </span>
                    ) : (
                      "Ingresar al sistema"
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  aria-expanded={mostrarAyudaPassword}
                  aria-controls="ayuda-restablecer-password"
                  onClick={() => setMostrarAyudaPassword((visible) => !visible)}
                  className="text-sm font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 transition hover:text-brand-800 focus-visible:rounded-sm dark:text-brand-300 dark:hover:text-brand-200"
                >
                  ¿Olvidaste tu contraseña?
                </button>
                {mostrarAyudaPassword && (
                  <div id="ayuda-restablecer-password">
                    <AlertMessage
                      tipo="info"
                      titulo="Solicita ayuda al administrador"
                      className="mt-3 text-left"
                    >
                      Por políticas de seguridad, las contraseñas son administradas por el Administrador General UPLA. Puedes solicitar la actualización de tu clave a:{" "}
                      <a
                        href={ENLACE_MAILTO_ADMINISTRADOR}
                        className="font-semibold text-brand-800 underline underline-offset-2 hover:text-brand-900 dark:text-brand-200 dark:hover:text-white"
                      >
                        {CORREO_ADMINISTRADOR}
                      </a>
                      {" "}(o abrir{" "}
                      <a
                        href={ENLACE_GMAIL_ADMINISTRADOR}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-brand-800 underline underline-offset-2 hover:text-brand-900 dark:text-brand-200 dark:hover:text-white"
                      >
                        redactar en Gmail
                      </a>
                      ).
                    </AlertMessage>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
