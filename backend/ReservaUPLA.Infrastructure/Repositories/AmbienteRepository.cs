using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Interfaces.Repositories;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Infrastructure.Data;

namespace ReservaUPLA.Infrastructure.Repositories;

public class AmbienteRepository : IAmbienteRepository
{
    private readonly AppDbContext _context;

    public AmbienteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Ambiente?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Ambientes.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Ambiente>> ListarAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Ambientes
            .AsNoTracking()
            .OrderBy(a => a.Nombre)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExisteNombreAsync(string nombre, CancellationToken cancellationToken = default)
    {
        // Comparación sin distinguir mayúsculas para evitar duplicados como "Sala A" / "sala a".
        var normalizado = nombre.ToLower();
        return await _context.Ambientes
            .AnyAsync(a => a.Nombre.ToLower() == normalizado, cancellationToken);
    }

    public async Task AgregarAsync(Ambiente ambiente, CancellationToken cancellationToken = default)
    {
        await _context.Ambientes.AddAsync(ambiente, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task ActualizarAsync(Ambiente ambiente, CancellationToken cancellationToken = default)
    {
        _context.Ambientes.Update(ambiente);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task EliminarAsync(Ambiente ambiente, CancellationToken cancellationToken = default)
    {
        _context.Ambientes.Remove(ambiente);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> TieneReservasAsociadasAsync(Guid ambienteId, CancellationToken cancellationToken = default)
    {
        return await _context.Reservas
            .AnyAsync(r => r.AmbienteId == ambienteId, cancellationToken);
    }
}
