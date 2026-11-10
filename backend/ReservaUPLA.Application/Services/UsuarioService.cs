using ReservaUPLA.Application.Common;
using ReservaUPLA.Application.Common.Exceptions;
using ReservaUPLA.Application.DTOs.Usuarios;
using ReservaUPLA.Application.Interfaces.Repositories;
using ReservaUPLA.Application.Interfaces.Services;
using ReservaUPLA.Domain.Constants;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;

    public UsuarioService(IUsuarioRepository usuarioRepository)
    {
        _usuarioRepository = usuarioRepository;
    }

    public async Task<UsuarioDto> CrearAsync(CrearUsuarioDto dto, CancellationToken cancellationToken = default)
    {
        // Normalización en backend (S1): el frontend también lo hace, pero no se confía en él.
        var nombre = dto.NombreCompleto.Trim();
        var correo = dto.Correo.Trim().ToLowerInvariant();
        var rol = dto.Rol.Trim();

        if (nombre.Length < 3)
        {
            throw new BusinessRuleException("El nombre completo debe tener al menos 3 caracteres.", 400);
        }

        if (!RolUsuario.EsValido(rol))
        {
            throw new BusinessRuleException("El rol seleccionado no es válido.", 400);
        }

        var password = dto.Password.Trim();
        var erroresPassword = PasswordPolicy.GetErrors(password);
        if (erroresPassword.Count > 0)
        {
            throw new BusinessRuleException(string.Join(" ", erroresPassword), 400);
        }

        if (await _usuarioRepository.ExisteCorreoAsync(correo, cancellationToken))
        {
            throw new BusinessRuleException("Ya existe un usuario registrado con ese correo.", 409);
        }

        var usuario = new Usuario
        {
            NombreCompleto = nombre,
            Correo = correo,
            Rol = rol,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password, 10),
            // El sistema decide estos valores; el cliente no los envía (S6).
            Activo = true
        };

        await _usuarioRepository.AgregarAsync(usuario, cancellationToken);

        return Mapear(usuario);
    }

    public async Task<IReadOnlyList<UsuarioDto>> ListarAsync(CancellationToken cancellationToken = default)
    {
        var usuarios = await _usuarioRepository.ListarAsync(cancellationToken);
        return usuarios.Select(Mapear).ToList();
    }

    public async Task<UsuarioDto> ActualizarAsync(Guid id, ActualizarUsuarioDto dto, Guid usuarioEjecutorId, CancellationToken cancellationToken = default)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(id, cancellationToken);
        if (usuario == null)
        {
            throw new BusinessRuleException("Usuario no encontrado.", 404);
        }

        var nombre = dto.NombreCompleto.Trim();
        if (nombre.Length < 3)
        {
            throw new BusinessRuleException("El nombre completo debe tener al menos 3 caracteres.", 400);
        }

        var rol = dto.Rol.Trim();
        if (!RolUsuario.EsValido(rol))
        {
            throw new BusinessRuleException("El rol seleccionado no es válido.", 400);
        }

        // Reglas de seguridad: no auto-bloqueo ni degradación accidental
        if (usuario.Id == usuarioEjecutorId)
        {
            if (rol != RolUsuario.Administrador)
            {
                throw new BusinessRuleException("No puedes retirar tu propio rol de Administrador.", 400);
            }

            if (!dto.Activo)
            {
                throw new BusinessRuleException("No puedes desactivar tu propia cuenta en sesión.", 400);
            }
        }

        usuario.NombreCompleto = nombre;
        usuario.Rol = rol;
        usuario.Activo = dto.Activo;

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            var password = dto.Password.Trim();
            var erroresPassword = PasswordPolicy.GetErrors(password);
            if (erroresPassword.Count > 0)
            {
                throw new BusinessRuleException(string.Join(" ", erroresPassword), 400);
            }

            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password, 10);
        }

        await _usuarioRepository.ActualizarAsync(usuario, cancellationToken);

        return Mapear(usuario);
    }

    public async Task<UsuarioDto> CambiarEstadoAsync(Guid id, bool activo, Guid usuarioEjecutorId, CancellationToken cancellationToken = default)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(id, cancellationToken);
        if (usuario == null)
        {
            throw new BusinessRuleException("Usuario no encontrado.", 404);
        }

        if (usuario.Id == usuarioEjecutorId && !activo)
        {
            throw new BusinessRuleException("No puedes desactivar tu propia cuenta en sesión.", 400);
        }

        usuario.Activo = activo;
        await _usuarioRepository.ActualizarAsync(usuario, cancellationToken);

        return Mapear(usuario);
    }

    public async Task<string> EliminarODesactivarAsync(Guid id, Guid usuarioEjecutorId, CancellationToken cancellationToken = default)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(id, cancellationToken);
        if (usuario == null)
        {
            throw new BusinessRuleException("Usuario no encontrado.", 404);
        }

        if (usuario.Id == usuarioEjecutorId)
        {
            throw new BusinessRuleException("No puedes eliminar ni desactivar tu propia cuenta en sesión.", 400);
        }

        var tieneReservas = await _usuarioRepository.TieneReservasAsociadasAsync(id, cancellationToken);

        if (tieneReservas)
        {
            // Baja lógica para proteger integridad y auditoría (Restrict en FK)
            usuario.Activo = false;
            await _usuarioRepository.ActualizarAsync(usuario, cancellationToken);
            return "El usuario tiene reservas registradas en el historial. Por trazabilidad y auditoría, su cuenta fue desactivada en lugar de eliminarse.";
        }

        await _usuarioRepository.EliminarAsync(usuario, cancellationToken);
        return "Usuario eliminado permanentemente del sistema.";
    }

    private static UsuarioDto Mapear(Usuario usuario) => new()
    {
        Id = usuario.Id,
        NombreCompleto = usuario.NombreCompleto,
        Correo = usuario.Correo,
        Rol = usuario.Rol,
        Activo = usuario.Activo
    };
}
