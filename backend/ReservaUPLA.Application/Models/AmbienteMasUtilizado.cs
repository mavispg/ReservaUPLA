namespace ReservaUPLA.Application.Models;

/// <summary>
/// Resultado de la consulta "ambiente más utilizado". Es un modelo de lectura,
/// no una entidad de dominio.
/// </summary>
public record AmbienteMasUtilizado(string Nombre, int TotalReservas);
