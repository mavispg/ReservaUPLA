using ReservaUPLA.Application.Common.Exceptions;
using ReservaUPLA.Application.DTOs.Auth;
using ReservaUPLA.Application.DTOs.Usuarios;
using ReservaUPLA.Application.Interfaces.Repositories;
using ReservaUPLA.Application.Interfaces.Services;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.Services;

/// <summary>
/// Servicio de autenticación real con contraseñas seguras (BCrypt) y tokens JWT.
/// </summary>
public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(
        IUsuarioRepository usuarioRepository,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _usuarioRepository = usuarioRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default)
    {
        var correo = dto.Correo.Trim().ToLowerInvariant();
        var password = dto.Password.Trim();

        var usuario = await _usuarioRepository.ObtenerPorCorreoAsync(correo, cancellationToken);

        // OWASP: Mismo mensaje para usuario inexistente o clave errónea para evitar enumeración.
        if (usuario is null || !usuario.Activo)
        {
            throw new BusinessRuleException("Correo o contraseña incorrectos.", 401);
        }

        bool passwordValida = false;
        try
        {
            passwordValida = BCrypt.Net.BCrypt.Verify(password, usuario.PasswordHash);
        }
        catch
        {
            passwordValida = false;
        }

        if (!passwordValida)
        {
            throw new BusinessRuleException("Correo o contraseña incorrectos.", 401);
        }

        var token = _jwtTokenGenerator.GenerarToken(usuario);

        return new AuthResponseDto
        {
            Token = token,
            Usuario = Mapear(usuario)
        };
    }

    public async Task<UsuarioDto> ObtenerPerfilAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(usuarioId, cancellationToken);
        if (usuario is null || !usuario.Activo)
        {
            throw new NotFoundException("Usuario no encontrado o inactivo.");
        }

        return Mapear(usuario);
    }

    private static UsuarioDto Mapear(Usuario usuario) => new()
    {
        Id = usuario.Id,
        NombreCompleto = usuario.NombreCompleto,
        Correo = usuario.Correo,
        Rol = usuario.Rol,
        Activo = usuario.Activo
    };
}
