using ReservaUPLA.Application.DTOs.Ambientes;

namespace ReservaUPLA.Application.Interfaces.Services;

public interface IAmbienteService
{
    Task<AmbienteDto> CrearAsync(CrearAmbienteDto dto, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AmbienteDto>> ListarAsync(CancellationToken cancellationToken = default);

    Task<AmbienteDto> ActualizarAsync(Guid id, ActualizarAmbienteDto dto, CancellationToken cancellationToken = default);

    Task<AmbienteDto> CambiarEstadoAsync(Guid id, string nuevoEstado, CancellationToken cancellationToken = default);

    Task<string> EliminarODesactivarAsync(Guid id, CancellationToken cancellationToken = default);
}
