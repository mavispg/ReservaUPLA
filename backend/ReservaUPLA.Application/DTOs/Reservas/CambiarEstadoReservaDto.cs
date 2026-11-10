using System.ComponentModel.DataAnnotations;

namespace ReservaUPLA.Application.DTOs.Reservas;

/// <summary>
/// Acción de aprobar, rechazar o cancelar.
/// UsuarioAccionId es una SIMULACIÓN del usuario autenticado: en producción
/// debe salir del token (JWT/Identity), nunca del cuerpo de la petición.
/// </summary>
public class CambiarEstadoReservaDto
{
    [Required(ErrorMessage = "Selecciona el nuevo estado.")]
    [MaxLength(30, ErrorMessage = "El estado no puede superar los 30 caracteres.")]
    public string Estado { get; set; } = string.Empty;

    /// <summary>
    /// ID del usuario que ejecuta la acción (se extrae preferentemente del token JWT autenticado).
    /// </summary>
    public Guid? UsuarioAccionId { get; set; }
}
