using System.ComponentModel.DataAnnotations;

namespace ReservaUPLA.Application.DTOs.Ambientes;

public class ActualizarAmbienteDto
{
    [Required(ErrorMessage = "El nombre del ambiente es obligatorio.")]
    [MinLength(3, ErrorMessage = "El nombre del ambiente debe tener al menos 3 caracteres.")]
    [MaxLength(100, ErrorMessage = "El nombre del ambiente no puede superar los 100 caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El tipo de ambiente es obligatorio.")]
    [MaxLength(50, ErrorMessage = "El tipo no puede superar los 50 caracteres.")]
    public string Tipo { get; set; } = string.Empty;

    [Range(1, 5000, ErrorMessage = "La capacidad debe ser un número entero entre 1 y 5000.")]
    public int Capacidad { get; set; }

    [Required(ErrorMessage = "La ubicación es obligatoria.")]
    [MinLength(3, ErrorMessage = "La ubicación debe tener al menos 3 caracteres.")]
    [MaxLength(100, ErrorMessage = "La ubicación no puede superar los 100 caracteres.")]
    public string Ubicacion { get; set; } = string.Empty;

    [Required(ErrorMessage = "El estado es obligatorio.")]
    [MaxLength(30, ErrorMessage = "El estado no puede superar los 30 caracteres.")]
    public string Estado { get; set; } = string.Empty;
}
