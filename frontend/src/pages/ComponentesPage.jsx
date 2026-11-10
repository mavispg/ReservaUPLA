import { useState } from "react";
import { Link } from "react-router-dom";
import AlertMessage from "../components/AlertMessage.jsx";
import Button from "../components/Button.jsx";
import CardIndicador from "../components/CardIndicador.jsx";
import DateInput from "../components/DateInput.jsx";
import EstadoBadge from "../components/EstadoBadge.jsx";
import ModalConfirmacion from "../components/ModalConfirmacion.jsx";
import SelectInput from "../components/SelectInput.jsx";
import TableList from "../components/TableList.jsx";
import TextInput from "../components/TextInput.jsx";
import TimeInput from "../components/TimeInput.jsx";
import { ESTADOS_RESERVA } from "../constants/estados.js";
import { formatDate, formatTime } from "../utils/formatDate.js";

const RESERVAS_DEMO = [
  {
    id: "r1",
    fecha: "2026-11-20",
    inicio: "10:00:00",
    fin: "12:00:00",
    ambiente: "Laboratorio A",
    solicitante: "Luis Pérez",
    estado: ESTADOS_RESERVA.APROBADA
  },
  {
    id: "r2",
    fecha: "2026-11-21",
    inicio: "09:00:00",
    fin: "10:00:00",
    ambiente: "Auditorio B",
    solicitante: "María Ruiz",
    estado: ESTADOS_RESERVA.PENDIENTE
  },
  {
    id: "r3",
    fecha: "2026-11-22",
    inicio: "15:00:00",
    fin: "17:00:00",
    ambiente: "Sala de reuniones",
    solicitante: "Carlos Díaz",
    estado: ESTADOS_RESERVA.RECHAZADA
  },
  {
    id: "r4",
    fecha: "2026-11-23",
    inicio: "08:00:00",
    fin: "09:00:00",
    ambiente: "Laboratorio B",
    solicitante: "Ana Torres",
    estado: ESTADOS_RESERVA.CANCELADA
  }
];

const COLUMNAS = [
  {
    clave: "fecha",
    encabezado: "Fecha",
    render: (fila) => formatDate(fila.fecha)
  },
  {
    clave: "horario",
    encabezado: "Horario",
    render: (fila) => `${formatTime(fila.inicio)} a ${formatTime(fila.fin)}`
  },
  { clave: "ambiente", encabezado: "Ambiente" },
  { clave: "solicitante", encabezado: "Solicitante" },
  {
    clave: "estado",
    encabezado: "Estado",
    render: (fila) => <EstadoBadge estado={fila.estado} />
  },
  {
    clave: "acciones",
    encabezado: "Acciones",
    alineacion: "right",
    render: (fila) => (
      <Link
        to={`/reservas/${fila.id}`}
        className="font-semibold text-brand-700 hover:text-brand-800"
      >
        Ver
      </Link>
    )
  }
];

const OPCIONES_ROL = [
  { value: "Administrador", label: "Administrador" },
  { value: "Solicitante", label: "Solicitante" },
  { value: "Responsable de ambiente", label: "Responsable de ambiente" }
];

function Icono({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function Seccion({ id, titulo, descripcion, children }) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <div>
        <h2 id={id} className="text-lg font-semibold text-slate-900">
          {titulo}
        </h2>
        {descripcion && (
          <p className="mt-1 text-sm text-slate-600">{descripcion}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function obtenerFechaLocalISO() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(hoy.getDate()).padStart(2, "0")}`;
}

const FECHA_MINIMA = obtenerFechaLocalISO();

export default function ComponentesPage() {
  const [nombre, setNombre] = useState("Laboratorio A");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("");
  const [rolError, setRolError] = useState("");
  const [fecha, setFecha] = useState("2026-11-20");
  const [inicio, setInicio] = useState("10:00");
  const [fin, setFin] = useState("12:00");

  const [botonCargando, setBotonCargando] = useState(false);
  const [alertas, setAlertas] = useState({
    exito: true,
    error: true,
    aviso: true,
    info: true
  });

  const [filas, setFilas] = useState(RESERVAS_DEMO);
  const [cargandoTabla, setCargandoTabla] = useState(false);
  const [errorTabla, setErrorTabla] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalVariante, setModalVariante] = useState("primario");
  const [modalCargando, setModalCargando] = useState(false);
  const [mensajeModal, setMensajeModal] = useState("");

  const errorCorreo =
    correo && !correo.includes("@") ? "Ingresa un correo válido." : "";
  const errorHorario =
    inicio && fin && fin <= inicio
      ? "La hora de fin debe ser mayor que la hora de inicio."
      : "";

  const validarRol = () => {
    setRolError(rol ? "" : "Selecciona un rol para continuar.");
  };

  const simularBoton = () => {
    setBotonCargando(true);
    window.setTimeout(() => setBotonCargando(false), 1200);
  };

  const simularCargaTabla = () => {
    setErrorTabla("");
    setCargandoTabla(true);
    window.setTimeout(() => setCargandoTabla(false), 1200);
  };

  const simularErrorTabla = () => {
    setCargandoTabla(false);
    setErrorTabla(
      "No se pudieron cargar las reservas. Revisa la conexión e intenta nuevamente."
    );
  };

  const vaciarTabla = () => {
    setErrorTabla("");
    setFilas([]);
  };

  const restaurarTabla = () => {
    setErrorTabla("");
    setCargandoTabla(false);
    setFilas(RESERVAS_DEMO);
  };

  const cerrarAlerta = (clave) => {
    setAlertas((previas) => ({ ...previas, [clave]: false }));
  };

  const restaurarAlertas = () => {
    setAlertas({ exito: true, error: true, aviso: true, info: true });
  };

  const abrirModal = (variante) => {
    setModalVariante(variante);
    setMensajeModal("");
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (!modalCargando) setModalAbierto(false);
  };

  const confirmarModal = () => {
    setModalCargando(true);
    window.setTimeout(() => {
      setModalCargando(false);
      setModalAbierto(false);
      setMensajeModal(
        modalVariante === "peligro"
          ? "Reserva rechazada correctamente."
          : "Reserva aprobada correctamente."
      );
    }, 900);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            Fase 5 · Página temporal
          </p>
          <h1 className="page-title">Componentes reutilizables</h1>
          <p className="page-subtitle">
            Muestra todos los componentes con sus estados normal, error,
            deshabilitado y carga. Esta página se retira al terminar la
            Fase 6.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          ← Volver al dashboard
        </Link>
      </header>

      {mensajeModal && (
        <AlertMessage
          tipo="success"
          titulo="Acción completada"
          onClose={() => setMensajeModal("")}
        >
          {mensajeModal}
        </AlertMessage>
      )}

      <Seccion
        id="formularios"
        titulo="Campos de formulario"
        descripcion="Etiquetas visibles, ayuda, error accesible y estados deshabilitados."
      >
        <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
          <TextInput
            label="Nombre del ambiente"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            hint="Ejemplo: Laboratorio A"
            placeholder="Escribe el nombre"
            required
            maxLength={100}
          />

          <TextInput
            label="Correo electrónico"
            type="email"
            value={correo}
            onChange={(event) => setCorreo(event.target.value)}
            error={errorCorreo}
            hint="Se usa para notificar la respuesta de la reserva."
            placeholder="usuario@upla.edu.pe"
            autoComplete="email"
          />

          <div>
            <SelectInput
              label="Rol del usuario"
              options={OPCIONES_ROL}
              value={rol}
              onChange={(event) => {
                setRol(event.target.value);
                setRolError("");
              }}
              error={rolError}
              placeholder="Selecciona un rol"
              required
            />
            <div className="mt-2">
              <Button variant="secondary" size="sm" onClick={validarRol}>
                Probar validación
              </Button>
            </div>
          </div>

          <TextInput
            label="Campo deshabilitado"
            value="Solo lectura"
            disabled
            hint="Así se ve un campo que no se puede editar."
          />

          <DateInput
            label="Fecha de la reserva"
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
            min={FECHA_MINIMA}
            hint="No se permiten fechas pasadas."
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TimeInput
              label="Hora de inicio"
              value={inicio}
              onChange={(event) => {
                setInicio(event.target.value);
                setFin("");
              }}
              hint="Formato de 24 horas (HH:MM), por ejemplo 13:30."
              required
            />
            <TimeInput
              label="Hora de fin"
              value={fin}
              onChange={(event) => setFin(event.target.value)}
              disabled={!inicio}
              error={errorHorario}
              hint={inicio ? `Formato de 24 horas · después de ${inicio}.` : "Selecciona primero la hora de inicio."}
              required
            />
          </div>
        </div>
      </Seccion>

      <Seccion
        id="botones"
        titulo="Botones"
        descripcion="Variantes, tamaños, estado de carga y bloqueo de doble envío."
      >
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <Button>Primario</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="danger">Peligro</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Pequeño</Button>
          <Button size="lg">Grande</Button>
          <Button loading loadingText="Registrando...">
            Registrar
          </Button>
          <Button disabled>Deshabilitado</Button>
          <Button
            variant="secondary"
            loading={botonCargando}
            loadingText="Enviando..."
            onClick={simularBoton}
          >
            Simular envío
          </Button>
        </div>
      </Seccion>

      <Seccion
        id="alertas"
        titulo="Mensajes de alerta"
        descripcion="Éxito, error, advertencia e información, con cierre opcional."
      >
        <div className="grid gap-3">
          {alertas.exito && (
            <AlertMessage
              tipo="success"
              titulo="Reserva aprobada"
              onClose={() => cerrarAlerta("exito")}
            >
              El ambiente quedó reservado para el 20/11/2026 de 10:00 a 12:00.
            </AlertMessage>
          )}

          {alertas.error && (
            <AlertMessage
              tipo="error"
              titulo="No se pudo registrar la reserva"
              onClose={() => cerrarAlerta("error")}
            >
              El ambiente ya tiene una reserva aprobada en ese horario.
            </AlertMessage>
          )}

          {alertas.aviso && (
            <AlertMessage
              tipo="warning"
              titulo="Revisa el horario"
              onClose={() => cerrarAlerta("aviso")}
            >
              El horario permitido es de 07:00 a 22:00.
            </AlertMessage>
          )}

          {alertas.info && (
            <AlertMessage
              tipo="info"
              titulo="Sesión activa"
              onClose={() => cerrarAlerta("info")}
            >
              Sesión verificada a través del servicio de identidad institucional.
            </AlertMessage>
          )}
        </div>

        <Button variant="secondary" size="sm" onClick={restaurarAlertas}>
          Restaurar alertas
        </Button>
      </Seccion>

      <Seccion
        id="estados"
        titulo="Badges de estado"
        descripcion="Color y texto juntos: el estado no depende solo del color."
      >
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {Object.values(ESTADOS_RESERVA).map((estado) => (
            <EstadoBadge key={estado} estado={estado} />
          ))}
          <EstadoBadge estado="En revisión" />
        </div>
      </Seccion>

      <Seccion
        id="indicadores"
        titulo="Tarjetas de indicadores"
        descripcion="Cinco tarjetas del dashboard, incluida una en estado de carga."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <CardIndicador
            titulo="Total de reservas"
            valor={24}
            descripcion="Todas las solicitudes registradas"
            tono="brand"
            icono={
              <Icono>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 11h18" />
              </Icono>
            }
          />

          <CardIndicador
            titulo="Pendientes"
            valor={5}
            descripcion="Esperando aprobación"
            tono="warning"
            icono={
              <Icono>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </Icono>
            }
          />

          <CardIndicador
            titulo="Aprobadas"
            valor={16}
            descripcion="Reservas confirmadas"
            tono="success"
            icono={
              <Icono>
                <circle cx="12" cy="12" r="9" />
                <path d="M8.5 12.5l2.5 2.5 4.5-5" />
              </Icono>
            }
          />

          <CardIndicador
            titulo="Rechazadas"
            valor={3}
            descripcion="Solicitudes no aceptadas"
            tono="danger"
            icono={
              <Icono>
                <circle cx="12" cy="12" r="9" />
                <path d="M9 9l6 6M15 9l-6 6" />
              </Icono>
            }
          />

          <CardIndicador
            titulo="Ambiente más utilizado"
            valor="Laboratorio A"
            descripcion="16 reservas aprobadas"
            tono="neutral"
            icono={
              <Icono>
                <path d="M3 21h18M5 21V7l7-4 7 4v14" />
                <path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />
              </Icono>
            }
          />

          <CardIndicador
            titulo="Tarjeta en carga"
            valor={null}
            descripcion="El esqueleto indica que los datos están llegando"
            tono="neutral"
            cargando
          />
        </div>
      </Seccion>

      <Seccion
        id="tabla"
        titulo="Tabla de datos"
        descripcion="Prueba los estados de carga, error y vacío con los botones."
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={simularCargaTabla}>
            Simular carga
          </Button>
          <Button variant="secondary" size="sm" onClick={simularErrorTabla}>
            Simular error
          </Button>
          <Button variant="secondary" size="sm" onClick={vaciarTabla}>
            Vaciar
          </Button>
          <Button variant="secondary" size="sm" onClick={restaurarTabla}>
            Restaurar
          </Button>
        </div>

        <TableList
          titulo="Reservas de ejemplo"
          descripcion="Datos ficticios solo para probar el componente."
          columnas={COLUMNAS}
          datos={filas}
          cargando={cargandoTabla}
          error={errorTabla}
          mensajeVacio="Aún no hay reservas. Crea la primera."
          accionVacio={
            <Button size="sm" onClick={restaurarTabla}>
              Restaurar ejemplos
            </Button>
          }
          className="mt-4"
        />
      </Seccion>

      <Seccion
        id="modal"
        titulo="Modal de confirmación"
        descripcion="Se abre con foco en Cancelar, cierra con Escape y bloquea el doble envío."
      >
        <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <Button onClick={() => abrirModal("primario")}>
            Abrir aprobación
          </Button>
          <Button variant="danger" onClick={() => abrirModal("peligro")}>
            Abrir rechazo
          </Button>
        </div>
      </Seccion>

      <ModalConfirmacion
        abierto={modalAbierto}
        titulo={
          modalVariante === "peligro" ? "Rechazar reserva" : "Aprobar reserva"
        }
        mensaje={
          modalVariante === "peligro"
            ? "La reserva pasará a estado Rechazada y ya no podrá modificarse. ¿Deseas continuar?"
            : "La reserva pasará a estado Aprobada. Se volverá a validar que no exista otro traslape."
        }
        textoConfirmar={
          modalVariante === "peligro" ? "Rechazar" : "Aprobar"
        }
        variante={modalVariante}
        cargando={modalCargando}
        onConfirmar={confirmarModal}
        onCerrar={cerrarModal}
      >
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Laboratorio A</p>
          <p>20/11/2026 · 10:00 a 12:00</p>
          <p>Solicitante: Luis Pérez</p>
        </div>
      </ModalConfirmacion>
    </div>
  );
}
