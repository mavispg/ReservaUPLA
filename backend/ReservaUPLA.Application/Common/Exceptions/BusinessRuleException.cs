namespace ReservaUPLA.Application.Common.Exceptions;

/// <summary>
/// Regla de negocio incumplida. El mensaje es seguro para mostrarlo al usuario
/// (nunca incluye detalles técnicos).
/// </summary>
public class BusinessRuleException : Exception
{
    public int StatusCode { get; }

    public BusinessRuleException(string message, int statusCode = 409) : base(message)
    {
        StatusCode = statusCode;
    }
}
