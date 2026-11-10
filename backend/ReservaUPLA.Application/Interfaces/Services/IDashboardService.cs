using ReservaUPLA.Application.DTOs.Dashboard;

namespace ReservaUPLA.Application.Interfaces.Services;

public interface IDashboardService
{
    Task<DashboardDto> ObtenerAsync(CancellationToken cancellationToken = default);
}
