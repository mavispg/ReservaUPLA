using ReservaUPLA.Application.Common.Exceptions;
using ReservaUPLA.Application.DTOs.Ambientes;
using ReservaUPLA.Application.Interfaces.Repositories;
using ReservaUPLA.Application.Interfaces.Services;
using ReservaUPLA.Domain.Constants;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.Services;

public class AmbienteService : IAmbienteService
{
    private readonly IAmbienteRepository _ambienteRepository;

    public AmbienteService(IAmbienteRepository ambienteRepository)
    {
        _ambienteRepository = ambienteRepository;
    }

    public async Task<AmbienteDto> CrearAsync(CrearAmbienteDto dto, CancellationToken cancellationToken = default)
    {
        var nombre = dto.Nombre.Trim();
        var tipo = dto.Tipo.Trim();
        var ubicacion = dto.Ubicacion.Trim();

        if (dto.Capacidad <= 0)
        {
            throw new BusinessRuleException("La capacidad debe ser mayor que cero.", 400);
        }

        if (await _ambienteRepository.ExisteNombreAsync(nombre, cancellationToken))
        {
            throw new BusinessRuleException("Ya existe un ambiente registrado con ese nombre.", 409);
        }

        var ambiente = new Ambiente
        {
            Nombre = nombre,
            Tipo = tipo,
            Capacidad = dto.Capacidad,
            Ubicacion = ubicacion,
            // Estado inicial decidido por el sistema (S6).
            Estado = EstadoAmbiente.Activo
        };

        await _ambienteRepository.AgregarAsync(ambiente, cancellationToken);

        return Mapear(ambiente);
    }

    public async Task<IReadOnlyList<AmbienteDto>> ListarAsync(CancellationToken cancellationToken = default)
    {
        var ambientes = await _ambienteRepository.ListarAsync(cancellationToken);
        return ambientes.Select(Mapear).ToList();
    }

    public async Task<AmbienteDto> ActualizarAsync(Guid id, ActualizarAmbienteDto dto, CancellationToken cancellationToken = default)
    {
        var ambiente = await _ambienteRepository.ObtenerPorIdAsync(id, cancellationToken);
        if (ambiente == null)
        {
            throw new BusinessRuleException("Ambiente no encontrado.", 404);
        }

        var nombre = dto.Nombre.Trim();
        var tipo = dto.Tipo.Trim();
        var ubicacion = dto.Ubicacion.Trim();
        var estado = dto.Estado.Trim();

        if (dto.Capacidad <= 0)
        {
            throw new BusinessRuleException("La capacidad debe ser mayor que cero.", 400);
        }

        if (!EstadoAmbiente.EsValido(estado))
        {
            throw new BusinessRuleException("El estado seleccionado no es válido. Usa Activo, Inactivo o Mantenimiento.", 400);
        }

        if (!string.Equals(ambiente.Nombre, nombre, StringComparison.OrdinalIgnoreCase) &&
            await _ambienteRepository.ExisteNombreAsync(nombre, cancellationToken))
        {
            throw new BusinessRuleException("Ya existe otro ambiente registrado con ese nombre.", 409);
        }

        ambiente.Nombre = nombre;
        ambiente.Tipo = tipo;
        ambiente.Capacidad = dto.Capacidad;
        ambiente.Ubicacion = ubicacion;
        ambiente.Estado = estado;

        await _ambienteRepository.ActualizarAsync(ambiente, cancellationToken);

        return Mapear(ambiente);
    }

    public async Task<AmbienteDto> CambiarEstadoAsync(Guid id, string nuevoEstado, CancellationToken cancellationToken = default)
    {
        var ambiente = await _ambienteRepository.ObtenerPorIdAsync(id, cancellationToken);
        if (ambiente == null)
        {
            throw new BusinessRuleException("Ambiente no encontrado.", 404);
        }

        var estado = nuevoEstado.Trim();
        if (!EstadoAmbiente.EsValido(estado))
        {
            throw new BusinessRuleException("El estado seleccionado no es válido.", 400);
        }

        ambiente.Estado = estado;
        await _ambienteRepository.ActualizarAsync(ambiente, cancellationToken);

        return Mapear(ambiente);
    }

    public async Task<string> EliminarODesactivarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var ambiente = await _ambienteRepository.ObtenerPorIdAsync(id, cancellationToken);
        if (ambiente == null)
        {
            throw new BusinessRuleException("Ambiente no encontrado.", 404);
        }

        var tieneReservas = await _ambienteRepository.TieneReservasAsociadasAsync(id, cancellationToken);

        if (tieneReservas)
        {
            ambiente.Estado = EstadoAmbiente.Inactivo;
            await _ambienteRepository.ActualizarAsync(ambiente, cancellationToken);
            return "El ambiente tiene reservas registradas en el historial. Por trazabilidad y auditoría, su estado fue cambiado a Inactivo en lugar de eliminarse.";
        }

        await _ambienteRepository.EliminarAsync(ambiente, cancellationToken);
        return "Ambiente eliminado permanentemente del sistema.";
    }

    private static AmbienteDto Mapear(Ambiente ambiente) => new()
    {
        Id = ambiente.Id,
        Nombre = ambiente.Nombre,
        Tipo = ambiente.Tipo,
        Capacidad = ambiente.Capacidad,
        Ubicacion = ambiente.Ubicacion,
        Estado = ambiente.Estado
    };
}
