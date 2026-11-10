namespace ReservaUPLA.Application.DTOs.Dashboard;

/// <summary>
/// Indicadores del panel principal. "AmbienteMásUtilizado" se calcula solo con
/// reservas APROBADAS (las que realmente ocuparon el ambiente).
/// </summary>
public class DashboardDto
{
    public int TotalReservas { get; set; }

    public int Pendientes { get; set; }

    public int Aprobadas { get; set; }

    public int Rechazadas { get; set; }

    public string? AmbienteMasUtilizado { get; set; }

    public int TotalReservasAmbienteMasUtilizado { get; set; }
}
