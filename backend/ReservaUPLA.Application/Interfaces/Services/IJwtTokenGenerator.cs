using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.Interfaces.Services;

/// <summary>
/// Contrato para la generación de tokens criptográficos JWT.
/// </summary>
public interface IJwtTokenGenerator
{
    string GenerarToken(Usuario usuario);
}
