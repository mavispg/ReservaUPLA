/**
 * Validaciones centralizadas de formulario (Frontend & Backend).
 * Cumple con principios de Usabilidad (ISO 9241-11 / Nielsen 5) y Reutilización (DRY).
 */

export function esCorreoValido(correo) {
  if (!correo) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
}

export function esEnteroEnRango(valor, minimo, maximo) {
  if (valor === "" || valor === null || valor === undefined) return false;
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= minimo && numero <= maximo;
}

export function esHorarioUniversitario(hora) {
  if (!/^\d{2}:\d{2}$/.test(hora)) return false;
  const [horas, minutos] = hora.split(":").map(Number);
  return (
    horas >= 7 &&
    horas <= 22 &&
    minutos >= 0 &&
    minutos <= 59 &&
    (horas < 22 || minutos === 0)
  );
}

export function esHoraFinMayor(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return true;
  return horaFin > horaInicio;
}

export function esFechaFuturaOActual(fecha, fechaMinima) {
  if (!fecha) return false;
  return fecha >= fechaMinima;
}

export function evaluarRequisitosPassword(password) {
  const valor = (password ?? "").trim();
  return [
    {
      clave: "longitud",
      etiqueta: "Mínimo 8 caracteres",
      mensaje: "al menos 8 caracteres",
      cumplido: valor.length >= 8
    },
    {
      clave: "mayuscula",
      etiqueta: "Una letra mayúscula (A-Z)",
      mensaje: "una letra mayúscula (A-Z)",
      cumplido: /[A-Z]/.test(valor)
    },
    {
      clave: "minuscula",
      etiqueta: "Una letra minúscula (a-z)",
      mensaje: "una letra minúscula (a-z)",
      cumplido: /[a-z]/.test(valor)
    },
    {
      clave: "numero",
      etiqueta: "Un número (0-9)",
      mensaje: "un número (0-9)",
      cumplido: /[0-9]/.test(valor)
    },
    {
      clave: "simbolo",
      etiqueta: "Un símbolo (ej.: ! @ # $ %)",
      mensaje: "un símbolo (ej.: ! @ # $ %)",
      cumplido: /[^\p{L}\p{N}\s]/u.test(valor)
    }
  ];
}

export function obtenerErrorPassword(password, obligatorio = true) {
  const valor = (password ?? "").trim();
  if (!valor) return obligatorio ? "La contraseña es obligatoria." : "";
  const requisitoPendiente = evaluarRequisitosPassword(valor).find(
    (requisito) => !requisito.cumplido
  );
  return requisitoPendiente
    ? `La contraseña debe incluir ${requisitoPendiente.mensaje}.`
    : "";
}

/**
 * Valida un campo individual de reserva para retroalimentación inmediata (onBlur / onChange).
 * Nielsen 9 & Shneiderman 3: Mensajes oportunos y comprensibles junto al campo.
 */
export function validarCampoReserva(campo, valor, formulario, fechaMinima) {
  switch (campo) {
    case "ambienteId":
      if (!valor) return "Selecciona el ambiente institucional.";
      return "";

    case "fecha":
      if (!valor) return "Selecciona la fecha de la reserva.";
      if (fechaMinima && valor < fechaMinima) {
        return "No se pueden registrar reservas para fechas pasadas.";
      }
      return "";

    case "horaInicio":
      if (!valor) return "Selecciona la hora de inicio.";
      if (!esHorarioUniversitario(valor)) {
        return "Ingresa una hora válida entre 07:00 y 22:00, en formato de 24 horas (HH:MM).";
      }
      return "";

    case "horaFin":
      if (!valor) return "Selecciona la hora de fin.";
      if (!esHorarioUniversitario(valor)) {
        return "Ingresa una hora válida entre 07:00 y 22:00, en formato de 24 horas (HH:MM).";
      }
      if (formulario.horaInicio && valor <= formulario.horaInicio) {
        return `La hora de fin debe ser posterior a la de inicio (${formulario.horaInicio}).`;
      }
      return "";

    case "motivo": {
      const texto = (valor || "").trim();
      if (!texto) return "El motivo de la reserva es obligatorio.";
      if (texto.length < 5) return "El motivo debe tener al menos 5 caracteres descriptivos.";
      if (texto.length > 500) return "El motivo no puede exceder los 500 caracteres.";
      return "";
    }

    default:
      return "";
  }
}

/**
 * Valida un campo de ambiente individual.
 */
export function validarCampoAmbiente(campo, valor) {
  switch (campo) {
    case "nombre": {
      const texto = (valor || "").trim();
      if (!texto) return "El nombre del ambiente es obligatorio.";
      if (texto.length < 3) return "El nombre debe tener al menos 3 caracteres.";
      if (texto.length > 100) return "El nombre no puede exceder los 100 caracteres.";
      return "";
    }

    case "tipo":
      if (!valor) return "Selecciona el tipo de ambiente.";
      return "";

    case "capacidad":
      if (!valor) return "La capacidad de aforo es obligatoria.";
      if (!esEnteroEnRango(valor, 1, 5000)) {
        return "La capacidad debe ser un número entero entre 1 y 5000 personas.";
      }
      return "";

    case "ubicacion": {
      const texto = (valor || "").trim();
      if (!texto) return "La ubicación en el campus es obligatoria.";
      if (texto.length < 3) return "La ubicación debe tener al menos 3 caracteres.";
      if (texto.length > 100) return "La ubicación no puede exceder los 100 caracteres.";
      return "";
    }

    default:
      return "";
  }
}

/**
 * Valida un campo de usuario individual.
 */
export function validarCampoUsuario(campo, valor) {
  switch (campo) {
    case "nombreCompleto": {
      const texto = (valor || "").trim();
      if (!texto) return "El nombre completo es obligatorio.";
      if (texto.length < 3) return "El nombre completo debe tener al menos 3 caracteres.";
      if (texto.length > 150) return "El nombre completo no puede exceder los 150 caracteres.";
      return "";
    }

    case "correo": {
      const texto = (valor || "").trim();
      if (!texto) return "El correo institucional es obligatorio.";
      if (!esCorreoValido(texto)) return "Ingresa un correo electrónico con formato válido.";
      if (!texto.toLowerCase().endsWith("@upla.edu.pe")) return "El correo debe pertenecer al dominio institucional (@upla.edu.pe).";
      if (texto.length > 150) return "El correo no puede exceder los 150 caracteres.";
      return "";
    }

    case "rol":
      if (!valor) return "Selecciona un rol para el usuario.";
      return "";

    case "password":
      return obtenerErrorPassword(valor);

    default:
      return "";
  }
}
