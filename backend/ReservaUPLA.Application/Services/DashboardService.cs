using ReservaUPLA.Application.DTOs.Dashboard;
using ReservaUPLA.Application.Interfaces.Repositories;
using ReservaUPLA.Application.Interfaces.Services;
using ReservaUPLA.Domain.Constants;

namespace ReservaUPLA.Application.Services;

/// <summary>
/// RF-08: indicadores del panel. La lógica de conteo vive aquí; el repositorio
/// solo ejecuta las consultas.
/// </summary>
public class DashboardService : IDashboardService
{
    private readonly IReservaRepository _reservaRepository;

    public DashboardService(IReservaRepository reservaRepository)
    {
        _reservaRepository = reservaRepository;
    }

    public async Task<DashboardDto> ObtenerAsync(CancellationToken cancellationToken = default)
    {
        var total = await _reservaRepository.ContarAsync(null, cancellationToken);
        var pendientes = await _reservaRepository.ContarAsync(EstadoReserva.Pendiente, cancellationToken);
        var aprobadas = await _reservaRepository.ContarAsync(EstadoReserva.Aprobada, cancellationToken);
        var rechazadas = await _reservaRepository.ContarAsync(EstadoReserva.Rechazada, cancellationToken);

        // "Más utilizado" = más reservas aprobadas (uso real del ambiente).
        var masUtilizado = await _reservaRepository.ObtenerAmbienteMasUtilizadoAsync(cancellationToken);

        return new DashboardDto
        {
            TotalReservas = total,
            Pendientes = pendientes,
            Aprobadas = aprobadas,
            Rechazadas = rechazadas,
            AmbienteMasUtilizado = masUtilizado?.Nombre,
            TotalReservasAmbienteMasUtilizado = masUtilizado?.TotalReservas ?? 0
        };
    }
}
