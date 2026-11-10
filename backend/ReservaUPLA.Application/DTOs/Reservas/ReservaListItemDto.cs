namespace ReservaUPLA.Application.DTOs.Reservas;

/// <summary>
/// Datos resumidos para el listado. Incluye nombres legibles para no mostrar Ids.
/// </summary>
public class ReservaListItemDto
{
    public Guid Id { get; set; }

    public DateOnly Fecha { get; set; }

    public TimeOnly HoraInicio { get; set; }

    public TimeOnly HoraFin { get; set; }

    public string Motivo { get; set; } = string.Empty;

    public string Estado { get; set; } = string.Empty;

    public Guid UsuarioId { get; set; }

    public string UsuarioNombre { get; set; } = string.Empty;

    public string AmbienteNombre { get; set; } = string.Empty;

    public DateTime FechaRegistro { get; set; }
}
