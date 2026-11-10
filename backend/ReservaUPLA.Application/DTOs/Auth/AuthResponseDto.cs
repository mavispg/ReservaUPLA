using ReservaUPLA.Application.DTOs.Usuarios;

namespace ReservaUPLA.Application.DTOs.Auth;

/// <summary>
/// Respuesta del endpoint de autenticación con el JWT y los datos de perfil.
/// </summary>
public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;

    public UsuarioDto Usuario { get; set; } = null!;
}
