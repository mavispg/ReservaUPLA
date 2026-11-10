namespace ReservaUPLA.Application.Common.Exceptions;

/// <summary>
/// Acción no permitida para el usuario actual (HTTP 403).
/// Se usa, por ejemplo, cuando un solicitante intenta aprobar (RN-05).
/// </summary>
public class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message)
    {
    }
}
