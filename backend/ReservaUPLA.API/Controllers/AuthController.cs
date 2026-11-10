using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.API.Models;
using ReservaUPLA.Application.DTOs.Auth;
using ReservaUPLA.Application.DTOs.Usuarios;
using ReservaUPLA.Application.Interfaces.Services;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Inicio de sesión real con credenciales institucionales.
    /// Valida contraseña con BCrypt y emite token criptográfico JWT.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login(
        [FromBody] LoginDto dto,
        CancellationToken cancellationToken)
    {
        var resultado = await _authService.LoginAsync(dto, cancellationToken);

        return Ok(new ApiResponse<AuthResponseDto>
        {
            Success = true,
            Message = "Sesión iniciada correctamente.",
            Data = resultado
        });
    }

    /// <summary>
    /// Obtiene el perfil del usuario autenticado a partir de su token JWT.
    /// </summary>
    [HttpGet("perfil")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UsuarioDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UsuarioDto>>> ObtenerPerfil(CancellationToken cancellationToken)
    {
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized(new ApiErrorResponse
            {
                Message = "Token inválido o sin identificador de usuario."
            });
        }

        var perfil = await _authService.ObtenerPerfilAsync(usuarioId, cancellationToken);

        return Ok(new ApiResponse<UsuarioDto>
        {
            Success = true,
            Message = "Perfil obtenido correctamente.",
            Data = perfil
        });
    }
}
