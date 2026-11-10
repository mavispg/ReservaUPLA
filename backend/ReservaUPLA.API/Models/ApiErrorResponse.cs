namespace ReservaUPLA.API.Models;

/// <summary>
/// Respuesta uniforme para errores. Nunca se expone ex.Message ni el stack trace
/// al cliente (S9); el detalle queda en los logs.
/// </summary>
public class ApiErrorResponse
{
    public bool Success { get; init; } = false;

    public string Message { get; init; } = string.Empty;

    public IDictionary<string, string[]>? Errors { get; init; }
}
