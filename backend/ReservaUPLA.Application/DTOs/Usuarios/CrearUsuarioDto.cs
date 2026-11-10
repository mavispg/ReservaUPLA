using System.ComponentModel.DataAnnotations;
using ReservaUPLA.Application.Common;

namespace ReservaUPLA.Application.DTOs.Usuarios;

/// <summary>
/// Datos que el cliente SÍ puede enviar al registrar un usuario.
/// No incluye Id ni Activo: los decide el sistema (anti sobre-posteo, S6).
/// </summary>
public class CrearUsuarioDto : IValidatableObject
{
    [Required(ErrorMessage = "El nombre completo es obligatorio.")]
    [MinLength(3, ErrorMessage = "El nombre completo debe tener al menos 3 caracteres.")]
    [MaxLength(150, ErrorMessage = "El nombre completo no puede superar los 150 caracteres.")]
    public string NombreCompleto { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "Ingresa un correo electrónico válido.")]
    [MaxLength(150, ErrorMessage = "El correo no puede superar los 150 caracteres.")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "Selecciona un rol.")]
    [MaxLength(50, ErrorMessage = "El rol no puede superar los 50 caracteres.")]
    public string Rol { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [MaxLength(100, ErrorMessage = "La contraseña no puede superar los 100 caracteres.")]
    public string Password { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        foreach (var error in PasswordPolicy.GetErrors(Password))
        {
            yield return new ValidationResult(error, new[] { nameof(Password) });
        }
    }
}
