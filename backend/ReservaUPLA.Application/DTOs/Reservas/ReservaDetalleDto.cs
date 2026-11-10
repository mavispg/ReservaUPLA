namespace ReservaUPLA.Application.DTOs.Reservas;

/// <summary>
/// Detalle completo de una reserva: incluye datos del solicitante, del ambiente
/// y la auditoría de quién la resolvió. El frontend no necesita consultar aparte.
/// </summary>
public class ReservaDetalleDto
{
    public Guid Id { get; set; }

    public DateOnly Fecha { get; set; }

    public TimeOnly HoraInicio { get; set; }

    public TimeOnly HoraFin { get; set; }

    public string Motivo { get; set; } = string.Empty;

    public string Estado { get; set; } = string.Empty;

    public Guid UsuarioId { get; set; }

    public string UsuarioNombre { get; set; } = string.Empty;

    public string UsuarioCorreo { get; set; } = string.Empty;

    public Guid AmbienteId { get; set; }

    public string AmbienteNombre { get; set; } = string.Empty;

    public string AmbienteTipo { get; set; } = string.Empty;

    public string AmbienteUbicacion { get; set; } = string.Empty;

    public int AmbienteCapacidad { get; set; }

    public DateTime FechaRegistro { get; set; }

    public Guid? ResueltoPorId { get; set; }

    public string? ResueltoPorNombre { get; set; }

    public DateTime? FechaResolucion { get; set; }
}
