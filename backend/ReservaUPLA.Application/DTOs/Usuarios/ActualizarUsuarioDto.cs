using System.ComponentModel.DataAnnotations;
using ReservaUPLA.Application.Common;

namespace ReservaUPLA.Application.DTOs.Usuarios;

public class ActualizarUsuarioDto : IValidatableObject
{
    [Required(ErrorMessage = "El nombre completo es obligatorio.")]
    [MinLength(3, ErrorMessage = "El nombre completo debe tener al menos 3 caracteres.")]
    [MaxLength(150, ErrorMessage = "El nombre completo no puede superar los 150 caracteres.")]
    public string NombreCompleto { get; set; } = string.Empty;

    [Required(ErrorMessage = "El rol es obligatorio.")]
    [MaxLength(50, ErrorMessage = "El rol no puede superar los 50 caracteres.")]
    public string Rol { get; set; } = string.Empty;

    public bool Activo { get; set; } = true;

    [MaxLength(100, ErrorMessage = "La contraseña no puede superar los 100 caracteres.")]
    public string? Password { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrWhiteSpace(Password))
        {
            yield break;
        }

        foreach (var error in PasswordPolicy.GetErrors(Password))
        {
            yield return new ValidationResult(error, new[] { nameof(Password) });
        }
    }
}
