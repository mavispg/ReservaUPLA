using ReservaUPLA.Application.DTOs.Usuarios;

namespace ReservaUPLA.Application.Interfaces.Services;

public interface IUsuarioService
{
    Task<UsuarioDto> CrearAsync(CrearUsuarioDto dto, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<UsuarioDto>> ListarAsync(CancellationToken cancellationToken = default);

    Task<UsuarioDto> ActualizarAsync(Guid id, ActualizarUsuarioDto dto, Guid usuarioEjecutorId, CancellationToken cancellationToken = default);

    Task<UsuarioDto> CambiarEstadoAsync(Guid id, bool activo, Guid usuarioEjecutorId, CancellationToken cancellationToken = default);

    Task<string> EliminarODesactivarAsync(Guid id, Guid usuarioEjecutorId, CancellationToken cancellationToken = default);
}
