namespace ReservaUPLA.Domain.Entities;

/// <summary>
/// Persona que interactúa con el sistema. El rol decide qué acciones puede ejecutar.
/// </summary>
public class Usuario
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string NombreCompleto { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    /// <summary>Valores permitidos en <see cref="Constants.RolUsuario"/>.</summary>
    public string Rol { get; set; } = string.Empty;

    /// <summary>Hash criptográfico de la contraseña (BCrypt).</summary>
    public string PasswordHash { get; set; } = string.Empty;

    public bool Activo { get; set; } = true;

    // Navegación: reservas que solicitó este usuario.
    public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();

    // Navegación: reservas que este usuario aprobó o rechazó (auditoría).
    public ICollection<Reserva> ReservasResueltas { get; set; } = new List<Reserva>();
}
