using ReservaUPLA.Application.Models;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.Interfaces.Repositories;

public interface IReservaRepository
{
    Task<Reserva?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Listado con filtros opcionales. Los filtros se combinan con AND y el
    /// resultado se ordena por fecha descendente (lo más reciente primero).
    /// </summary>
    Task<IReadOnlyList<Reserva>> ListarAsync(
        string? estado = null,
        Guid? ambienteId = null,
        DateOnly? fecha = null,
        CancellationToken cancellationToken = default);

    Task<int> ContarAsync(string? estado = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Ambiente con más reservas APROBADAS. Devuelve null si todavía no hay
    /// ninguna reserva aprobada.
    /// </summary>
    Task<AmbienteMasUtilizado?> ObtenerAmbienteMasUtilizadoAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Devuelve la primera reserva APROBADA del ambiente y fecha cuyo rango
    /// [HoraInicio, HoraFin) se traslapa con el rango indicado (RN-01).
    /// </summary>
    Task<Reserva?> ObtenerTraslapeAprobadoAsync(
        Guid ambienteId,
        DateOnly fecha,
        TimeOnly horaInicio,
        TimeOnly horaFin,
        Guid? excluirReservaId = null,
        CancellationToken cancellationToken = default);

    Task AgregarAsync(Reserva reserva, CancellationToken cancellationToken = default);

    Task ActualizarAsync(Reserva reserva, CancellationToken cancellationToken = default);
}
