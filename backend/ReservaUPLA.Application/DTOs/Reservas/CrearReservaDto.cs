using System.ComponentModel.DataAnnotations;

namespace ReservaUPLA.Application.DTOs.Reservas;

/// <summary>
/// Datos que el cliente puede enviar al crear una reserva.
/// El Id, el Estado inicial ("Pendiente") y las fechas de auditoría los decide
/// el sistema (S6). Si el cliente envía "estado" en el cuerpo, se ignora.
/// </summary>
public class CrearReservaDto : IValidatableObject
{
    [Required(ErrorMessage = "Selecciona la fecha de la reserva.")]
    public DateOnly Fecha { get; set; }

    [Required(ErrorMessage = "Selecciona la hora de inicio.")]
    public TimeOnly HoraInicio { get; set; }

    [Required(ErrorMessage = "Selecciona la hora de fin.")]
    public TimeOnly HoraFin { get; set; }

    [Required(ErrorMessage = "El motivo es obligatorio.")]
    [MinLength(5, ErrorMessage = "El motivo debe tener al menos 5 caracteres.")]
    [MaxLength(500, ErrorMessage = "El motivo no puede superar los 500 caracteres.")]
    public string Motivo { get; set; } = string.Empty;

    [Required(ErrorMessage = "Selecciona el usuario solicitante.")]
    public Guid UsuarioId { get; set; }

    [Required(ErrorMessage = "Selecciona el ambiente.")]
    public Guid AmbienteId { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Fecha == default)
        {
            yield return new ValidationResult(
                "Selecciona la fecha de la reserva.",
                new[] { nameof(Fecha) });
        }

        if (UsuarioId == Guid.Empty)
        {
            yield return new ValidationResult(
                "Selecciona el usuario solicitante.",
                new[] { nameof(UsuarioId) });
        }

        if (AmbienteId == Guid.Empty)
        {
            yield return new ValidationResult(
                "Selecciona el ambiente.",
                new[] { nameof(AmbienteId) });
        }

        // RN-03: la hora de fin debe ser mayor que la de inicio.
        if (HoraFin <= HoraInicio)
        {
            yield return new ValidationResult(
                "La hora de fin debe ser mayor que la hora de inicio.",
                new[] { nameof(HoraFin) });
        }

        // RN-04: solo se permite reservar entre 07:00 y 22:00.
        if (HoraInicio < new TimeOnly(7, 0) || HoraFin > new TimeOnly(22, 0))
        {
            yield return new ValidationResult(
                "El horario permitido es de 07:00 a 22:00.",
                new[] { nameof(HoraInicio) });
        }
    }
}
