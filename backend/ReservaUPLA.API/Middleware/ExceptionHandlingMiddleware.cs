using Microsoft.EntityFrameworkCore;
using ReservaUPLA.API.Models;
using ReservaUPLA.Application.Common.Exceptions;

namespace ReservaUPLA.API.Middleware;

/// <summary>
/// Captura cualquier excepción no controlada y responde con el formato
/// { success: false, message: "..." }. El detalle técnico solo va a ILogger (S9).
/// </summary>
public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            if (context.Response.HasStarted)
            {
                _logger.LogError(ex, "La respuesta ya comenzó a enviarse; no se puede escribir el error.");
                return;
            }

            await ManejarAsync(context, ex);
        }
    }

    private async Task ManejarAsync(HttpContext context, Exception ex)
    {
        switch (ex)
        {
            case BusinessRuleException regla:
                await EscribirAsync(context, regla.StatusCode, regla.Message);
                break;

            case NotFoundException noEncontrado:
                await EscribirAsync(context, StatusCodes.Status404NotFound, noEncontrado.Message);
                break;

            case ForbiddenException prohibido:
                await EscribirAsync(context, StatusCodes.Status403Forbidden, prohibido.Message);
                break;

            case BadHttpRequestException:
                _logger.LogWarning(ex, "Solicitud con formato inválido en {Metodo} {Ruta}.",
                    context.Request.Method, context.Request.Path);
                await EscribirAsync(
                    context,
                    StatusCodes.Status400BadRequest,
                    "La solicitud no tiene un formato válido.");
                break;

            case DbUpdateException:
                // Colisión de índices únicos u otra restricción de la base.
                // El detalle real queda en el log, no en la respuesta.
                _logger.LogWarning(ex, "Conflicto al guardar en base de datos en {Metodo} {Ruta}.",
                    context.Request.Method, context.Request.Path);
                await EscribirAsync(
                    context,
                    StatusCodes.Status409Conflict,
                    "No se pudo guardar la información porque entra en conflicto con un registro existente.");
                break;

            default:
                _logger.LogError(ex, "Error no controlado en {Metodo} {Ruta}.",
                    context.Request.Method, context.Request.Path);
                await EscribirAsync(
                    context,
                    StatusCodes.Status500InternalServerError,
                    "Ocurrió un error interno.");
                break;
        }
    }

    private static async Task EscribirAsync(
        HttpContext context,
        int statusCode,
        string message,
        IDictionary<string, string[]>? errors = null)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json; charset=utf-8";

        await context.Response.WriteAsJsonAsync(new ApiErrorResponse
        {
            Message = message,
            Errors = errors
        });
    }
}
