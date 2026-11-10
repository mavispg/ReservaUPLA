namespace ReservaUPLA.Domain.Entities;

/// <summary>
/// Solicitud de uso de un ambiente en una fecha y rango horario.
/// </summary>
public class Reserva
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public DateOnly Fecha { get; set; }

    public TimeOnly HoraInicio { get; set; }

    public TimeOnly HoraFin { get; set; }

    public string Motivo { get; set; } = string.Empty;

    /// <summary>Valores permitidos en <see cref="Constants.EstadoReserva"/>.</summary>
    public string Estado { get; set; } = Constants.EstadoReserva.Pendiente;

    public Guid UsuarioId { get; set; }

    public Guid AmbienteId { get; set; }

    // ---- Trazabilidad / auditoría (S10) ----

    /// <summary>Momento en que se registró la solicitud (UTC).</summary>
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    /// <summary>Administrador que aprobó o rechazó. Nulo mientras está Pendiente.</summary>
    public Guid? ResueltoPorId { get; set; }

    /// <summary>Momento en que se aprobó o rechazó (UTC).</summary>
    public DateTime? FechaResolucion { get; set; }

    // Navegación
    public Usuario Usuario { get; set; } = null!;

    public Ambiente Ambiente { get; set; } = null!;

    public Usuario? ResueltoPor { get; set; }
}
