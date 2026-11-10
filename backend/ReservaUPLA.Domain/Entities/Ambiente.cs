namespace ReservaUPLA.Domain.Entities;

/// <summary>
/// Espacio físico reservable: laboratorio, auditorio, sala de reuniones, etc.
/// </summary>
public class Ambiente
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Nombre { get; set; } = string.Empty;

    public string Tipo { get; set; } = string.Empty;

    public int Capacidad { get; set; }

    public string Ubicacion { get; set; } = string.Empty;

    /// <summary>Valores permitidos en <see cref="Constants.EstadoAmbiente"/>.</summary>
    public string Estado { get; set; } = Constants.EstadoAmbiente.Activo;

    public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
}
