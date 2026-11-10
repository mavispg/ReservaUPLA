using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.API.Models;
using ReservaUPLA.Application.DTOs.Dashboard;
using ReservaUPLA.Application.Interfaces.Services;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Produces("application/json")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>RF-08: total, pendientes, aprobadas, rechazadas y ambiente más utilizado.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<DashboardDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<DashboardDto>>> Obtener(CancellationToken cancellationToken)
    {
        var dashboard = await _dashboardService.ObtenerAsync(cancellationToken);

        return Ok(new ApiResponse<DashboardDto>
        {
            Success = true,
            Message = "Indicadores obtenidos correctamente.",
            Data = dashboard
        });
    }
}
