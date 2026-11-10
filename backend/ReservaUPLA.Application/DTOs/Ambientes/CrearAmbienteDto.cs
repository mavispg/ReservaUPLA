using System.ComponentModel.DataAnnotations;

namespace ReservaUPLA.Application.DTOs.Ambientes;

/// <summary>
/// Datos permitidos al registrar un ambiente. El Estado inicial lo decide el
/// sistema ("Activo"), por eso no aparece en este DTO (S6).
/// </summary>
public class CrearAmbienteDto
{
    [Required(ErrorMessage = "El nombre del ambiente es obligatorio.")]
    [MinLength(3, ErrorMessage = "El nombre debe tener al menos 3 caracteres.")]
    [MaxLength(100, ErrorMessage = "El nombre no puede superar los 100 caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El tipo de ambiente es obligatorio.")]
    [MinLength(3, ErrorMessage = "El tipo debe tener al menos 3 caracteres.")]
    [MaxLength(50, ErrorMessage = "El tipo no puede superar los 50 caracteres.")]
    public string Tipo { get; set; } = string.Empty;

    [Range(1, 5000, ErrorMessage = "La capacidad debe estar entre 1 y 5000 personas.")]
    public int Capacidad { get; set; }

    [Required(ErrorMessage = "La ubicación es obligatoria.")]
    [MinLength(3, ErrorMessage = "La ubicación debe tener al menos 3 caracteres.")]
    [MaxLength(100, ErrorMessage = "La ubicación no puede superar los 100 caracteres.")]
    public string Ubicacion { get; set; } = string.Empty;
}
