namespace ReservaUPLA.Application.Common.Exceptions;

/// <summary>El recurso solicitado no existe (HTTP 404).</summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }
}
