using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.API.Models;
using ReservaUPLA.Application.DTOs.Reservas;
using ReservaUPLA.Application.Interfaces.Services;
using ReservaUPLA.Domain.Constants;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Route("api/reservas")]
[Produces("application/json")]
public class ReservasController : ControllerBase
{
    private readonly IReservaService _reservaService;

    public ReservasController(IReservaService reservaService)
    {
        _reservaService = reservaService;
    }

    /// <summary>
    /// RF-05: lista reservas con filtros opcionales por estado, ambiente y fecha.
    /// Los filtros se combinan; el resultado llega ordenado por fecha descendente.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ReservaListItemDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ReservaListItemDto>>>> Listar(
        [FromQuery] string? estado,
        [FromQuery] Guid? ambienteId,
        [FromQuery] DateOnly? fecha,
        CancellationToken cancellationToken)
    {
        var reservas = await _reservaService.ListarAsync(
            estado,
            ambienteId,
            fecha,
            cancellationToken);

        var mensaje = reservas.Count switch
        {
            0 => "No se encontraron reservas con esos filtros.",
            1 => "Se encontró 1 reserva.",
            _ => $"Se encontraron {reservas.Count} reservas."
        };

        return Ok(new ApiResponse<IReadOnlyList<ReservaListItemDto>>
        {
            Success = true,
            Message = mensaje,
            Data = reservas
        });
    }

    /// <summary>RF-06: detalle completo con solicitante, ambiente y auditoría.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ReservaDetalleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ReservaDetalleDto>>> ObtenerDetalle(
        Guid id,
        CancellationToken cancellationToken)
    {
        var reserva = await _reservaService.ObtenerDetalleAsync(id, cancellationToken);

        return Ok(new ApiResponse<ReservaDetalleDto>
        {
            Success = true,
            Message = "Reserva obtenida correctamente.",
            Data = reserva
        });
    }

    /// <summary>
    /// RF-03 / RF-04: registra una solicitud después de validar disponibilidad.
    /// Si el usuario está autenticado, su ID se toma del token JWT.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ReservaDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<ReservaDto>>> Crear(
        [FromBody] CrearReservaDto dto,
        CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (dto.UsuarioId == Guid.Empty && Guid.TryParse(userIdClaim, out var usuarioIdToken))
        {
            dto.UsuarioId = usuarioIdToken;
        }

        var reserva = await _reservaService.CrearAsync(dto, cancellationToken);

        return StatusCode(StatusCodes.Status201Created, new ApiResponse<ReservaDto>
        {
            Success = true,
            Message = "Reserva registrada correctamente. Queda pendiente de aprobación.",
            Data = reserva
        });
    }

    /// <summary>
    /// RF-07 / RN-05 / RN-06 / S10: aprueba, rechaza o cancela.
    /// La identidad del usuario se toma criptográficamente del token JWT (o del cuerpo en llamadas manuales).
    /// </summary>
    [HttpPatch("{id:guid}/estado")]
    [ProducesResponseType(typeof(ApiResponse<ReservaDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<ReservaDto>>> CambiarEstado(
        Guid id,
        [FromBody] CambiarEstadoReservaDto dto,
        CancellationToken cancellationToken)
    {
        // Seguridad real: se extrae del token firmado si está disponible
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdClaim, out var usuarioIdToken))
        {
            dto.UsuarioAccionId = usuarioIdToken;
        }

        var reserva = await _reservaService.CambiarEstadoAsync(id, dto, cancellationToken);

        var mensaje = reserva.Estado switch
        {
            EstadoReserva.Aprobada => "Reserva aprobada correctamente.",
            EstadoReserva.Rechazada => "Reserva rechazada correctamente.",
            EstadoReserva.Cancelada => "Reserva cancelada correctamente.",
            _ => "Reserva actualizada correctamente."
        };

        return Ok(new ApiResponse<ReservaDto>
        {
            Success = true,
            Message = mensaje,
            Data = reserva
        });
    }
}
