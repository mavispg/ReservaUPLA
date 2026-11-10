using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ReservaUPLA.Application.Interfaces.Services;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Infrastructure.Services;

/// <summary>
/// Generador de tokens JWT firmado criptográficamente con HMAC-SHA256.
/// Incorpora claims de identidad y rol (OWASP A01: Broken Access Control).
/// </summary>
public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _configuration;

    public JwtTokenGenerator(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerarToken(Usuario usuario)
    {
        var secretKey = _configuration["Jwt:Key"]
            ?? "ClaveSecretaReservaUPLA_SuperSegura2026_Minimo32Caracteres!";
        var issuer = _configuration["Jwt:Issuer"] ?? "ReservaUPLA.API";
        var audience = _configuration["Jwt:Audience"] ?? "ReservaUPLA.Frontend";
        var expiracionMinutos = int.TryParse(_configuration["Jwt:ExpirationMinutes"], out var mins) ? mins : 480; // 8 horas

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new(ClaimTypes.Email, usuario.Correo),
            new(ClaimTypes.Name, usuario.NombreCompleto),
            new(ClaimTypes.Role, usuario.Rol),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddMinutes(expiracionMinutos),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
