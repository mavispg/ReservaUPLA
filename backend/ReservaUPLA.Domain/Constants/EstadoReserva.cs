namespace ReservaUPLA.Domain.Constants;

/// <summary>
/// Estados de una reserva. Se centralizan aquí para no repetir "magic strings"
/// ni en el backend ni en las validaciones.
/// </summary>
public static class EstadoReserva
{
    public const string Pendiente = "Pendiente";
    public const string Aprobada = "Aprobada";
    public const string Rechazada = "Rechazada";
    public const string Cancelada = "Cancelada";

    public static readonly IReadOnlyList<string> Todos = new[]
    {
        Pendiente,
        Aprobada,
        Rechazada,
        Cancelada
    };

    public static bool EsValido(string estado) => Todos.Contains(estado);
}
