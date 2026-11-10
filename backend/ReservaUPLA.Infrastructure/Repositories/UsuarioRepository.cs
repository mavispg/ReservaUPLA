using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Interfaces.Repositories;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Infrastructure.Data;

namespace ReservaUPLA.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly AppDbContext _context;

    public UsuarioRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Usuario?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<Usuario?> ObtenerPorCorreoAsync(string correo, CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == correo, cancellationToken);
    }

    public async Task<IReadOnlyList<Usuario>> ListarAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios
            .AsNoTracking()
            .OrderBy(u => u.NombreCompleto)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExisteCorreoAsync(string correo, CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios
            .AnyAsync(u => u.Correo == correo, cancellationToken);
    }

    public async Task AgregarAsync(Usuario usuario, CancellationToken cancellationToken = default)
    {
        await _context.Usuarios.AddAsync(usuario, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task ActualizarAsync(Usuario usuario, CancellationToken cancellationToken = default)
    {
        _context.Usuarios.Update(usuario);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task EliminarAsync(Usuario usuario, CancellationToken cancellationToken = default)
    {
        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> TieneReservasAsociadasAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        return await _context.Reservas
            .AnyAsync(r => r.UsuarioId == usuarioId || r.ResueltoPorId == usuarioId, cancellationToken);
    }
}
