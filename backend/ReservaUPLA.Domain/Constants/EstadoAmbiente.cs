namespace ReservaUPLA.Domain.Constants;

public static class EstadoAmbiente
{
    public const string Activo = "Activo";
    public const string Inactivo = "Inactivo";
    public const string Mantenimiento = "Mantenimiento";

    public static readonly IReadOnlyList<string> Todos = new[]
    {
        Activo,
        Inactivo,
        Mantenimiento
    };

    public static bool EsValido(string estado) => Todos.Contains(estado);
}
