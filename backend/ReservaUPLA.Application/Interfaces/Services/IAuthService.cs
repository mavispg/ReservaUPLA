using ReservaUPLA.Application.DTOs.Auth;
using ReservaUPLA.Application.DTOs.Usuarios;

namespace ReservaUPLA.Application.Interfaces.Services;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default);

    Task<UsuarioDto> ObtenerPerfilAsync(Guid usuarioId, CancellationToken cancellationToken = default);
}
