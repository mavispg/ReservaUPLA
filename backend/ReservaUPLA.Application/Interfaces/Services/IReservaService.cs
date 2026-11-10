using ReservaUPLA.Application.DTOs.Reservas;

namespace ReservaUPLA.Application.Interfaces.Services;

public interface IReservaService
{
    Task<ReservaDto> CrearAsync(CrearReservaDto dto, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ReservaListItemDto>> ListarAsync(
        string? estado,
        Guid? ambienteId,
        DateOnly? fecha,
        CancellationToken cancellationToken = default);

    Task<ReservaDetalleDto> ObtenerDetalleAsync(Guid reservaId, CancellationToken cancellationToken = default);

    Task<ReservaDto> CambiarEstadoAsync(
        Guid reservaId,
        CambiarEstadoReservaDto dto,
        CancellationToken cancellationToken = default);
}
