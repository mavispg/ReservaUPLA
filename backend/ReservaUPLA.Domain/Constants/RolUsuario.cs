namespace ReservaUPLA.Domain.Constants;

public static class RolUsuario
{
    public const string Solicitante = "Solicitante";
    public const string Administrador = "Administrador";
    public const string ResponsableAmbiente = "Responsable de ambiente";

    public static readonly IReadOnlyList<string> Todos = new[]
    {
        Solicitante,
        Administrador,
        ResponsableAmbiente
    };

    public static bool EsValido(string rol) => Todos.Contains(rol);
}
