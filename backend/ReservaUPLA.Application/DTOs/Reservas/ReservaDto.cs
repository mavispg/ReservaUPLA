namespace ReservaUPLA.Application.DTOs.Reservas;

/// <summary>
/// Salida de una reserva con nombres legibles (no solo Ids), para que el
/// frontend no tenga que hacer consultas adicionales.
/// </summary>
public class ReservaDto
{
    public Guid Id { get; set; }

    public DateOnly Fecha { get; set; }

    public TimeOnly HoraInicio { get; set; }

    public TimeOnly HoraFin { get; set; }

    public string Motivo { get; set; } = string.Empty;

    public string Estado { get; set; } = string.Empty;

    public Guid UsuarioId { get; set; }

    public string UsuarioNombre { get; set; } = string.Empty;

    public Guid AmbienteId { get; set; }

    public string AmbienteNombre { get; set; } = string.Empty;

    public DateTime FechaRegistro { get; set; }

    public Guid? ResueltoPorId { get; set; }

    public string? ResueltoPorNombre { get; set; }

    public DateTime? FechaResolucion { get; set; }
}
