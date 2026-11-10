using System.ComponentModel.DataAnnotations;

namespace ReservaUPLA.Application.DTOs.Auth;

/// <summary>
/// Credenciales reales para inicio de sesión en ReservaUPLA.
/// </summary>
public class LoginDto
{
    [Required(ErrorMessage = "El correo electrónico es obligatorio.")]
    [EmailAddress(ErrorMessage = "Ingresa un correo electrónico válido.")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres.")]
    public string Password { get; set; } = string.Empty;
}
