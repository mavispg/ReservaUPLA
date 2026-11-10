using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.API.Models;
using ReservaUPLA.Application.DTOs.Usuarios;
using ReservaUPLA.Application.Interfaces.Services;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Route("api/usuarios")]
[Produces("application/json")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;

    public UsuariosController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    /// <summary>
    /// Lista los usuarios para llenar los selects del frontend
    /// (reconocer en vez de recordar: nunca se escribe un Id a mano).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<UsuarioDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<UsuarioDto>>>> Listar(
        CancellationToken cancellationToken)
    {
        var usuarios = await _usuarioService.ListarAsync(cancellationToken);

        return Ok(new ApiResponse<IReadOnlyList<UsuarioDto>>
        {
            Success = true,
            Message = "Usuarios obtenidos correctamente.",
            Data = usuarios
        });
    }

    /// <summary>RF-01: registrar un usuario solicitante (o de otro rol).</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<UsuarioDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<UsuarioDto>>> Crear(
        [FromBody] CrearUsuarioDto dto,
        CancellationToken cancellationToken)
    {
        // La validación de ModelState ocurre antes de entrar aquí:
        // InvalidModelStateResponseFactory (Program.cs) devuelve { success:false, errors }.
        var usuario = await _usuarioService.CrearAsync(dto, cancellationToken);

        return StatusCode(StatusCodes.Status201Created, new ApiResponse<UsuarioDto>
        {
            Success = true,
            Message = "Usuario registrado correctamente.",
            Data = usuario
        });
    }

    /// <summary>Actualiza los datos de un usuario (Nombre, Rol, Activo y contraseña opcional).</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UsuarioDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UsuarioDto>>> Actualizar(
        Guid id,
        [FromBody] ActualizarUsuarioDto dto,
        CancellationToken cancellationToken)
    {
        var ejecutorId = ObtenerUsuarioEjecutorId();
        var usuario = await _usuarioService.ActualizarAsync(id, dto, ejecutorId, cancellationToken);

        return Ok(new ApiResponse<UsuarioDto>
        {
            Success = true,
            Message = "Usuario actualizado correctamente.",
            Data = usuario
        });
    }

    /// <summary>Cambia el estado Activo/Inactivo de un usuario.</summary>
    [HttpPatch("{id:guid}/estado")]
    [ProducesResponseType(typeof(ApiResponse<UsuarioDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UsuarioDto>>> CambiarEstado(
        Guid id,
        [FromBody] CambiarEstadoUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var ejecutorId = ObtenerUsuarioEjecutorId();
        var usuario = await _usuarioService.CambiarEstadoAsync(id, request.Activo, ejecutorId, cancellationToken);

        return Ok(new ApiResponse<UsuarioDto>
        {
            Success = true,
            Message = usuario.Activo ? "Usuario activado correctamente." : "Usuario desactivado correctamente.",
            Data = usuario
        });
    }

    /// <summary>Elimina físicamente al usuario si no tiene reservas o lo desactiva si tiene historial.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> Eliminar(
        Guid id,
        CancellationToken cancellationToken)
    {
        var ejecutorId = ObtenerUsuarioEjecutorId();
        var mensaje = await _usuarioService.EliminarODesactivarAsync(id, ejecutorId, cancellationToken);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = mensaje
        });
    }

    private Guid ObtenerUsuarioEjecutorId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdClaim, out var id) ? id : Guid.Empty;
    }
}

public class CambiarEstadoUsuarioRequest
{
    public bool Activo { get; set; }
}
