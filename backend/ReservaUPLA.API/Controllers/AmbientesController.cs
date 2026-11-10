using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.API.Models;
using ReservaUPLA.Application.DTOs.Ambientes;
using ReservaUPLA.Application.Interfaces.Services;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Route("api/ambientes")]
[Produces("application/json")]
public class AmbientesController : ControllerBase
{
    private readonly IAmbienteService _ambienteService;

    public AmbientesController(IAmbienteService ambienteService)
    {
        _ambienteService = ambienteService;
    }

    /// <summary>Lista los ambientes para el selector del formulario de reservas.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<AmbienteDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AmbienteDto>>>> Listar(
        CancellationToken cancellationToken)
    {
        var ambientes = await _ambienteService.ListarAsync(cancellationToken);

        return Ok(new ApiResponse<IReadOnlyList<AmbienteDto>>
        {
            Success = true,
            Message = "Ambientes obtenidos correctamente.",
            Data = ambientes
        });
    }

    /// <summary>RF-02: registrar un ambiente.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<AmbienteDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<AmbienteDto>>> Crear(
        [FromBody] CrearAmbienteDto dto,
        CancellationToken cancellationToken)
    {
        var ambiente = await _ambienteService.CrearAsync(dto, cancellationToken);

        return StatusCode(StatusCodes.Status201Created, new ApiResponse<AmbienteDto>
        {
            Success = true,
            Message = "Ambiente registrado correctamente.",
            Data = ambiente
        });
    }

    /// <summary>Actualiza los datos de un ambiente.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<AmbienteDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AmbienteDto>>> Actualizar(
        Guid id,
        [FromBody] ActualizarAmbienteDto dto,
        CancellationToken cancellationToken)
    {
        var ambiente = await _ambienteService.ActualizarAsync(id, dto, cancellationToken);

        return Ok(new ApiResponse<AmbienteDto>
        {
            Success = true,
            Message = "Ambiente actualizado correctamente.",
            Data = ambiente
        });
    }

    /// <summary>Cambia el estado de un ambiente (Activo, Inactivo, Mantenimiento).</summary>
    [HttpPatch("{id:guid}/estado")]
    [ProducesResponseType(typeof(ApiResponse<AmbienteDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AmbienteDto>>> CambiarEstado(
        Guid id,
        [FromBody] CambiarEstadoAmbienteRequest request,
        CancellationToken cancellationToken)
    {
        var ambiente = await _ambienteService.CambiarEstadoAsync(id, request.Estado, cancellationToken);

        return Ok(new ApiResponse<AmbienteDto>
        {
            Success = true,
            Message = $"Estado del ambiente cambiado a {ambiente.Estado}.",
            Data = ambiente
        });
    }

    /// <summary>Elimina un ambiente o cambia su estado a Inactivo si tiene reservas asociadas.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> Eliminar(
        Guid id,
        CancellationToken cancellationToken)
    {
        var mensaje = await _ambienteService.EliminarODesactivarAsync(id, cancellationToken);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = mensaje
        });
    }
}

public class CambiarEstadoAmbienteRequest
{
    public string Estado { get; set; } = string.Empty;
}
