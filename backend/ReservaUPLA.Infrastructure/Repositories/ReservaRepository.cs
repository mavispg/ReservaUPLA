using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Interfaces.Repositories;
using ReservaUPLA.Application.Models;
using ReservaUPLA.Domain.Constants;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Infrastructure.Data;

namespace ReservaUPLA.Infrastructure.Repositories;

public class ReservaRepository : IReservaRepository
{
    private readonly AppDbContext _context;

    public ReservaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Reserva?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Reservas
            .Include(r => r.Usuario)
            .Include(r => r.Ambiente)
            .Include(r => r.ResueltoPor)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Reserva>> ListarAsync(
        string? estado = null,
        Guid? ambienteId = null,
        DateOnly? fecha = null,
        CancellationToken cancellationToken = default)
    {
        IQueryable<Reserva> consulta = _context.Reservas
            .AsNoTracking()
            .Include(r => r.Usuario)
            .Include(r => r.Ambiente);

        // Los filtros son opcionales y se combinan con AND.
        if (!string.IsNullOrWhiteSpace(estado))
        {
            consulta = consulta.Where(r => r.Estado == estado);
        }

        if (ambienteId.HasValue)
        {
            consulta = consulta.Where(r => r.AmbienteId == ambienteId.Value);
        }

        if (fecha.HasValue)
        {
            consulta = consulta.Where(r => r.Fecha == fecha.Value);
        }

        return await consulta
            .OrderByDescending(r => r.Fecha)
            .ThenBy(r => r.HoraInicio)
            .ThenBy(r => r.Ambiente.Nombre)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> ContarAsync(string? estado = null, CancellationToken cancellationToken = default)
    {
        IQueryable<Reserva> consulta = _context.Reservas.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(estado))
        {
            consulta = consulta.Where(r => r.Estado == estado);
        }

        return await consulta.CountAsync(cancellationToken);
    }

    public async Task<AmbienteMasUtilizado?> ObtenerAmbienteMasUtilizadoAsync(
        CancellationToken cancellationToken = default)
    {
        // Solo cuentan las reservas aprobadas: son las que ocuparon el ambiente.
        var agrupado = await _context.Reservas
            .AsNoTracking()
            .Where(r => r.Estado == EstadoReserva.Aprobada)
            .GroupBy(r => r.AmbienteId)
            .Select(g => new { AmbienteId = g.Key, Total = g.Count() })
            .OrderByDescending(x => x.Total)
            .ThenBy(x => x.AmbienteId)
            .FirstOrDefaultAsync(cancellationToken);

        if (agrupado is null)
        {
            return null;
        }

        var nombre = await _context.Ambientes
            .AsNoTracking()
            .Where(a => a.Id == agrupado.AmbienteId)
            .Select(a => a.Nombre)
            .FirstOrDefaultAsync(cancellationToken);

        return new AmbienteMasUtilizado(nombre ?? "Sin datos", agrupado.Total);
    }

    public async Task<Reserva?> ObtenerTraslapeAprobadoAsync(
        Guid ambienteId,
        DateOnly fecha,
        TimeOnly horaInicio,
        TimeOnly horaFin,
        Guid? excluirReservaId = null,
        CancellationToken cancellationToken = default)
    {
        // Traslape de rangos semiabiertos [inicio, fin):
        // existe conflicto si la reserva existente empieza antes de que termine la nueva
        // y termina después de que empieza la nueva.
        return await _context.Reservas
            .AsNoTracking()
            .Where(r => r.AmbienteId == ambienteId
                        && r.Fecha == fecha
                        && r.Estado == EstadoReserva.Aprobada
                        && r.HoraInicio < horaFin
                        && r.HoraFin > horaInicio
                        && (excluirReservaId == null || r.Id != excluirReservaId))
            .OrderBy(r => r.HoraInicio)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AgregarAsync(Reserva reserva, CancellationToken cancellationToken = default)
    {
        await _context.Reservas.AddAsync(reserva, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task ActualizarAsync(Reserva reserva, CancellationToken cancellationToken = default)
    {
        // La reserva ya viene rastreada por ObtenerPorIdAsync: solo se persisten
        // sus cambios. No se usa Update() para no marcar también Usuario/Ambiente.
        await _context.SaveChangesAsync(cancellationToken);
    }
}
