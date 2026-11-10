using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.Interfaces.Repositories;

/// <summary>
/// "Promesa" de acceso a usuarios. Application solo conoce esta interfaz;
/// Infrastructure es quien la implementa con EF Core (DIP).
/// </summary>
public interface IUsuarioRepository
{
    Task<Usuario?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Usuario?> ObtenerPorCorreoAsync(string correo, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Usuario>> ListarAsync(CancellationToken cancellationToken = default);

    Task<bool> ExisteCorreoAsync(string correo, CancellationToken cancellationToken = default);

    Task AgregarAsync(Usuario usuario, CancellationToken cancellationToken = default);

    Task ActualizarAsync(Usuario usuario, CancellationToken cancellationToken = default);

    Task EliminarAsync(Usuario usuario, CancellationToken cancellationToken = default);

    Task<bool> TieneReservasAsociadasAsync(Guid usuarioId, CancellationToken cancellationToken = default);
}
