using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.Interfaces.Repositories;

public interface IAmbienteRepository
{
    Task<Ambiente?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Ambiente>> ListarAsync(CancellationToken cancellationToken = default);

    Task<bool> ExisteNombreAsync(string nombre, CancellationToken cancellationToken = default);

    Task AgregarAsync(Ambiente ambiente, CancellationToken cancellationToken = default);

    Task ActualizarAsync(Ambiente ambiente, CancellationToken cancellationToken = default);

    Task EliminarAsync(Ambiente ambiente, CancellationToken cancellationToken = default);

    Task<bool> TieneReservasAsociadasAsync(Guid ambienteId, CancellationToken cancellationToken = default);
}
