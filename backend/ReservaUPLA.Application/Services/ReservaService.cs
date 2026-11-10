using ReservaUPLA.Application.Common.Exceptions;
using ReservaUPLA.Application.DTOs.Reservas;
using ReservaUPLA.Application.Interfaces.Repositories;
using ReservaUPLA.Application.Interfaces.Services;
using ReservaUPLA.Domain.Constants;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.Services;

/// <summary>
/// Aquí vive la lógica de negocio de las reservas (RN-01 a RN-06). Los
/// controladores solo reciben, delegan y responden.
/// </summary>
public class ReservaService : IReservaService
{
    private static readonly TimeOnly HoraApertura = new(7, 0);
    private static readonly TimeOnly HoraCierre = new(22, 0);

    private readonly IReservaRepository _reservaRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IAmbienteRepository _ambienteRepository;

    public ReservaService(
        IReservaRepository reservaRepository,
        IUsuarioRepository usuarioRepository,
        IAmbienteRepository ambienteRepository)
    {
        _reservaRepository = reservaRepository;
        _usuarioRepository = usuarioRepository;
        _ambienteRepository = ambienteRepository;
    }

    public async Task<ReservaDto> CrearAsync(CrearReservaDto dto, CancellationToken cancellationToken = default)
    {
        var motivo = dto.Motivo.Trim();

        ValidarHorario(dto.Fecha, dto.HoraInicio, dto.HoraFin);

        if (motivo.Length < 5)
        {
            throw new BusinessRuleException("El motivo debe tener al menos 5 caracteres.", 400);
        }

        // Prevención de errores: no se registran reservas en fechas pasadas.
        if (dto.Fecha < DateOnly.FromDateTime(DateTime.Today))
        {
            throw new BusinessRuleException("No se pueden registrar reservas para fechas pasadas.", 400);
        }

        var usuario = await _usuarioRepository.ObtenerPorIdAsync(dto.UsuarioId, cancellationToken);
        if (usuario is null || !usuario.Activo)
        {
            throw new BusinessRuleException("El usuario solicitante no existe o está inactivo.", 400);
        }

        var ambiente = await _ambienteRepository.ObtenerPorIdAsync(dto.AmbienteId, cancellationToken);
        if (ambiente is null)
        {
            throw new BusinessRuleException("El ambiente seleccionado no existe.", 400);
        }

        if (ambiente.Estado != EstadoAmbiente.Activo)
        {
            throw new BusinessRuleException("El ambiente no está disponible para reservas.", 409);
        }

        // RF-04 / RN-01: el ambiente no debe tener otra reserva APROBADA que se traslape.
        var conflicto = await _reservaRepository.ObtenerTraslapeAprobadoAsync(
            ambiente.Id,
            dto.Fecha,
            dto.HoraInicio,
            dto.HoraFin,
            cancellationToken: cancellationToken);

        if (conflicto is not null)
        {
            throw new BusinessRuleException(
                MensajeTraslape(conflicto.HoraInicio, conflicto.HoraFin),
                409);
        }

        var reserva = new Reserva
        {
            Fecha = dto.Fecha,
            HoraInicio = dto.HoraInicio,
            HoraFin = dto.HoraFin,
            Motivo = motivo,
            // El cliente no puede imponer el estado ni la auditoría (S6).
            Estado = EstadoReserva.Pendiente,
            UsuarioId = usuario.Id,
            AmbienteId = ambiente.Id,
            FechaRegistro = DateTime.UtcNow
        };

        // Se asignan las navegaciones ya cargadas solo para poder responder con nombres.
        reserva.Usuario = usuario;
        reserva.Ambiente = ambiente;

        await _reservaRepository.AgregarAsync(reserva, cancellationToken);

        return Mapear(reserva);
    }

    public async Task<IReadOnlyList<ReservaListItemDto>> ListarAsync(
        string? estado,
        Guid? ambienteId,
        DateOnly? fecha,
        CancellationToken cancellationToken = default)
    {
        string? estadoNormalizado = null;

        if (!string.IsNullOrWhiteSpace(estado))
        {
            // Se acepta "aprobada" o "Aprobada": el filtro es amigable, no estricto.
            estadoNormalizado = EstadoReserva.Todos.FirstOrDefault(e =>
                string.Equals(e, estado.Trim(), StringComparison.OrdinalIgnoreCase));

            if (estadoNormalizado is null)
            {
                throw new BusinessRuleException(
                    "El estado del filtro no es válido. Usa Pendiente, Aprobada, Rechazada o Cancelada.",
                    400);
            }
        }

        var reservas = await _reservaRepository.ListarAsync(
            estadoNormalizado,
            ambienteId,
            fecha,
            cancellationToken);

        return reservas.Select(MapearLista).ToList();
    }

    public async Task<ReservaDetalleDto> ObtenerDetalleAsync(
        Guid reservaId,
        CancellationToken cancellationToken = default)
    {
        var reserva = await _reservaRepository.ObtenerPorIdAsync(reservaId, cancellationToken);

        if (reserva is null)
        {
            throw new NotFoundException("La reserva no existe.");
        }

        return MapearDetalle(reserva);
    }

    public async Task<ReservaDto> CambiarEstadoAsync(
        Guid reservaId,
        CambiarEstadoReservaDto dto,
        CancellationToken cancellationToken = default)
    {
        var nuevoEstado = dto.Estado.Trim();

        if (nuevoEstado != EstadoReserva.Aprobada
            && nuevoEstado != EstadoReserva.Rechazada
            && nuevoEstado != EstadoReserva.Cancelada)
        {
            throw new BusinessRuleException(
                "El estado solicitado no es válido. Usa Aprobada, Rechazada o Cancelada.",
                400);
        }

        var reserva = await _reservaRepository.ObtenerPorIdAsync(reservaId, cancellationToken);
        if (reserva is null)
        {
            throw new NotFoundException("La reserva no existe.");
        }

        // RN-06: una reserva rechazada es inmutable. Se valida antes de cualquier cambio.
        if (reserva.Estado == EstadoReserva.Rechazada)
        {
            throw new BusinessRuleException("Una reserva rechazada no puede modificarse.", 409);
        }

        if (reserva.Estado == EstadoReserva.Cancelada)
        {
            throw new BusinessRuleException("Una reserva cancelada no puede modificarse.", 409);
        }

        if (reserva.Estado == nuevoEstado)
        {
            throw new BusinessRuleException($"La reserva ya se encuentra en estado {nuevoEstado}.", 409);
        }

        // Máquina de estados simple: una aprobada solo puede cancelarse.
        if (reserva.Estado == EstadoReserva.Aprobada && nuevoEstado != EstadoReserva.Cancelada)
        {
            throw new BusinessRuleException("Una reserva aprobada solo puede cancelarse.", 409);
        }

        // RN-05 / S2: la autorización se verifica en el servicio, no solo en la interfaz.
        if (!dto.UsuarioAccionId.HasValue || dto.UsuarioAccionId == Guid.Empty)
        {
            throw new ForbiddenException("No se proporcionó la identidad del usuario que ejecuta la acción.");
        }

        var actor = await _usuarioRepository.ObtenerPorIdAsync(dto.UsuarioAccionId.Value, cancellationToken);
        if (actor is null || !actor.Activo)
        {
            throw new ForbiddenException("El usuario que ejecuta la acción no existe o está inactivo.");
        }

        var esAdministrador = actor.Rol == RolUsuario.Administrador;

        if ((nuevoEstado == EstadoReserva.Aprobada || nuevoEstado == EstadoReserva.Rechazada)
            && !esAdministrador)
        {
            throw new ForbiddenException("Solo un administrador activo puede aprobar o rechazar reservas.");
        }

        // Cancelar: lo puede hacer el administrador o el propio solicitante.
        if (nuevoEstado == EstadoReserva.Cancelada
            && !esAdministrador
            && reserva.UsuarioId != actor.Id)
        {
            throw new ForbiddenException("Solo el solicitante o un administrador pueden cancelar esta reserva.");
        }

        // RN-01: al aprobar se vuelve a validar el traslape (no basta con la creación).
        if (nuevoEstado == EstadoReserva.Aprobada)
        {
            var conflicto = await _reservaRepository.ObtenerTraslapeAprobadoAsync(
                reserva.AmbienteId,
                reserva.Fecha,
                reserva.HoraInicio,
                reserva.HoraFin,
                excluirReservaId: reserva.Id,
                cancellationToken: cancellationToken);

            if (conflicto is not null)
            {
                throw new BusinessRuleException(
                    MensajeTraslape(conflicto.HoraInicio, conflicto.HoraFin),
                    409);
            }
        }

        // S10: auditoría de quién resolvió y cuándo.
        reserva.Estado = nuevoEstado;
        reserva.ResueltoPorId = actor.Id;
        reserva.ResueltoPor = actor;
        reserva.FechaResolucion = DateTime.UtcNow;

        await _reservaRepository.ActualizarAsync(reserva, cancellationToken);

        return Mapear(reserva);
    }

    /// <summary>RN-03 y RN-04, validadas otra vez en el servidor.</summary>
    private static void ValidarHorario(DateOnly fecha, TimeOnly horaInicio, TimeOnly horaFin)
    {
        if (fecha == default)
        {
            throw new BusinessRuleException("Selecciona la fecha de la reserva.", 400);
        }

        if (horaFin <= horaInicio)
        {
            throw new BusinessRuleException("La hora de fin debe ser mayor que la hora de inicio.", 400);
        }

        if (horaInicio < HoraApertura || horaFin > HoraCierre)
        {
            throw new BusinessRuleException("El horario permitido es de 07:00 a 22:00.", 400);
        }
    }

    /// <summary>Mensaje accionable: dice el horario ocupado y qué hacer.</summary>
    private static string MensajeTraslape(TimeOnly inicio, TimeOnly fin)
    {
        return $"El ambiente ya tiene una reserva aprobada de {inicio:HH:mm} a {fin:HH:mm} ese día. Elige otro horario.";
    }

    private static ReservaListItemDto MapearLista(Reserva reserva) => new()
    {
        Id = reserva.Id,
        Fecha = reserva.Fecha,
        HoraInicio = reserva.HoraInicio,
        HoraFin = reserva.HoraFin,
        Motivo = reserva.Motivo,
        Estado = reserva.Estado,
        UsuarioId = reserva.UsuarioId,
        UsuarioNombre = reserva.Usuario?.NombreCompleto ?? string.Empty,
        AmbienteNombre = reserva.Ambiente?.Nombre ?? string.Empty,
        FechaRegistro = reserva.FechaRegistro
    };

    private static ReservaDetalleDto MapearDetalle(Reserva reserva) => new()
    {
        Id = reserva.Id,
        Fecha = reserva.Fecha,
        HoraInicio = reserva.HoraInicio,
        HoraFin = reserva.HoraFin,
        Motivo = reserva.Motivo,
        Estado = reserva.Estado,
        UsuarioId = reserva.UsuarioId,
        UsuarioNombre = reserva.Usuario?.NombreCompleto ?? string.Empty,
        UsuarioCorreo = reserva.Usuario?.Correo ?? string.Empty,
        AmbienteId = reserva.AmbienteId,
        AmbienteNombre = reserva.Ambiente?.Nombre ?? string.Empty,
        AmbienteTipo = reserva.Ambiente?.Tipo ?? string.Empty,
        AmbienteUbicacion = reserva.Ambiente?.Ubicacion ?? string.Empty,
        AmbienteCapacidad = reserva.Ambiente?.Capacidad ?? 0,
        FechaRegistro = reserva.FechaRegistro,
        ResueltoPorId = reserva.ResueltoPorId,
        ResueltoPorNombre = reserva.ResueltoPor?.NombreCompleto,
        FechaResolucion = reserva.FechaResolucion
    };

    private static ReservaDto Mapear(Reserva reserva) => new()
    {
        Id = reserva.Id,
        Fecha = reserva.Fecha,
        HoraInicio = reserva.HoraInicio,
        HoraFin = reserva.HoraFin,
        Motivo = reserva.Motivo,
        Estado = reserva.Estado,
        UsuarioId = reserva.UsuarioId,
        UsuarioNombre = reserva.Usuario?.NombreCompleto ?? string.Empty,
        AmbienteId = reserva.AmbienteId,
        AmbienteNombre = reserva.Ambiente?.Nombre ?? string.Empty,
        FechaRegistro = reserva.FechaRegistro,
        ResueltoPorId = reserva.ResueltoPorId,
        ResueltoPorNombre = reserva.ResueltoPor?.NombreCompleto,
        FechaResolucion = reserva.FechaResolucion
    };
}
