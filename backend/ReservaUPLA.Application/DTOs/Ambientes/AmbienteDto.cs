namespace ReservaUPLA.Application.DTOs.Ambientes;

public class AmbienteDto
{
    public Guid Id { get; set; }

    public string Nombre { get; set; } = string.Empty;

    public string Tipo { get; set; } = string.Empty;

    public int Capacidad { get; set; }

    public string Ubicacion { get; set; } = string.Empty;

    public string Estado { get; set; } = string.Empty;
}
