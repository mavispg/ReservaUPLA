using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Domain.Constants;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Infrastructure.Data;

/// <summary>
/// Siembra las cuentas y ambientes iniciales de la UPLA y reservas de demostración
/// con identificadores estables para que puedan agregarse sin duplicar registros.
/// </summary>
public static class DatabaseSeeder
{
    public static async Task InicializarAsync(AppDbContext context)
    {
        // 1. Usuarios institucionales reales (upsert seguro)
        var usuariosBase = new[]
        {
            // --- ADMINISTRADORES ---
            new Usuario
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                NombreCompleto = "Administrador General UPLA",
                Correo = "admin@upla.edu.pe",
                Rol = RolUsuario.Administrador,
                Activo = true,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!", 10)
            },
            new Usuario
            {
                Id = Guid.Parse("11111111-1111-1111-1111-222222222222"),
                NombreCompleto = "Ana Torres",
                Correo = "ana.admin@upla.edu.pe",
                Rol = RolUsuario.Administrador,
                Activo = true,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!", 10)
            },

            // --- SOLICITANTES (DOCENTES) ---
            new Usuario
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                NombreCompleto = "Ing. Carlos Mendoza (Docente)",
                Correo = "docente@upla.edu.pe",
                Rol = RolUsuario.Solicitante,
                Activo = true,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Docente123!", 10)
            },
            new Usuario
            {
                Id = Guid.Parse("22222222-2222-2222-2222-333333333333"),
                NombreCompleto = "Jose Carlos Madero",
                Correo = "jose@upla.edu.pe",
                Rol = RolUsuario.Solicitante,
                Activo = true,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Docente123!", 10)
            },
            new Usuario
            {
                Id = Guid.Parse("22222222-2222-2222-2222-444444444444"),
                NombreCompleto = "Luis Perez",
                Correo = "luis@upla.edu.pe",
                Rol = RolUsuario.Solicitante,
                Activo = true,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Docente123!", 10)
            },

            // --- RESPONSABLES DE AMBIENTE ---
            new Usuario
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                NombreCompleto = "Lic. María Elena Rojas (Encargada)",
                Correo = "responsable@upla.edu.pe",
                Rol = RolUsuario.ResponsableAmbiente,
                Activo = true,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Responsable123!", 10)
            },
            new Usuario
            {
                Id = Guid.Parse("33333333-3333-3333-3333-444444444444"),
                NombreCompleto = "Rosa Quispe",
                Correo = "rosa@upla.edu.pe",
                Rol = RolUsuario.ResponsableAmbiente,
                Activo = true,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Responsable123!", 10)
            },
            new Usuario
            {
                Id = Guid.Parse("33333333-3333-3333-3333-555555555555"),
                NombreCompleto = "Sofia Quispe",
                Correo = "sofia@upla.edu.pe",
                Rol = RolUsuario.ResponsableAmbiente,
                Activo = true,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Responsable123!", 10)
            }
        };

        foreach (var u in usuariosBase)
        {
            var existente = await context.Usuarios.FirstOrDefaultAsync(x => x.Correo == u.Correo);
            if (existente is null)
            {
                context.Usuarios.Add(u);
            }
            else
            {
                existente.NombreCompleto = u.NombreCompleto;
                existente.Rol = u.Rol;
                existente.Activo = true;
                existente.PasswordHash = u.PasswordHash;
            }
        }

        await context.SaveChangesAsync();

        // 2. Asegura que existan los ambientes usados por los registros de demostración.
        var ambientesDemo = new[]
        {
            new Ambiente
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                Nombre = "Laboratorio de Cómputo 101",
                Tipo = "Laboratorio de cómputo",
                Capacidad = 30,
                Ubicacion = "Pabellón B - Piso 1",
                Estado = EstadoAmbiente.Activo
            },
            new Ambiente
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                Nombre = "Auditorio Central UPLA",
                Tipo = "Auditorio",
                Capacidad = 150,
                Ubicacion = "Pabellón Central - Nivel 1",
                Estado = EstadoAmbiente.Activo
            },
            new Ambiente
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                Nombre = "Sala de Grados y Títulos",
                Tipo = "Sala de reuniones",
                Capacidad = 40,
                Ubicacion = "Pabellón A - Piso 2",
                Estado = EstadoAmbiente.Activo
            },
            new Ambiente
            {
                Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                Nombre = "Laboratorio de Redes y Telecomunicaciones",
                Tipo = "Laboratorio especializado",
                Capacidad = 25,
                Ubicacion = "Pabellón C - Piso 3",
                Estado = EstadoAmbiente.Activo
            }
        };
        var nombresDemo = ambientesDemo.Select(a => a.Nombre).ToArray();
        var nombresExistentes = await context.Ambientes
            .Where(a => nombresDemo.Contains(a.Nombre))
            .Select(a => a.Nombre)
            .ToListAsync();
        var ambientesFaltantes = ambientesDemo
            .Where(a => !nombresExistentes.Contains(a.Nombre))
            .ToList();

        if (ambientesFaltantes.Count > 0)
        {
            await context.Ambientes.AddRangeAsync(ambientesFaltantes);
            await context.SaveChangesAsync();
        }

        await CrearReservasDemostracionAsync(context, ambientesDemo);
    }

    private static async Task CrearReservasDemostracionAsync(
        AppDbContext context,
        IReadOnlyList<Ambiente> ambientesDemo)
    {
        var docente = await context.Usuarios
            .FirstOrDefaultAsync(u => u.Correo == "docente@upla.edu.pe");
        var administrador = await context.Usuarios
            .FirstOrDefaultAsync(u => u.Correo == "admin@upla.edu.pe");
        var nombresDemo = ambientesDemo.Select(a => a.Nombre).ToArray();
        var ambientes = await context.Ambientes
            .Where(a => nombresDemo.Contains(a.Nombre))
            .ToDictionaryAsync(a => a.Nombre);

        if (docente is null || administrador is null ||
            ambientes.Count != ambientesDemo.Count)
        {
            throw new InvalidOperationException(
                "No se pudieron crear las reservas de demostración porque faltan los usuarios o ambientes iniciales.");
        }

        var muestras = new List<(string Ambiente, int MesesAtras, string Estado)>
        {
            ("Laboratorio de Cómputo 101", 0, EstadoReserva.Aprobada),
            ("Laboratorio de Cómputo 101", 0, EstadoReserva.Aprobada),
            ("Laboratorio de Cómputo 101", 1, EstadoReserva.Aprobada),
            ("Laboratorio de Cómputo 101", 1, EstadoReserva.Aprobada),
            ("Laboratorio de Cómputo 101", 2, EstadoReserva.Aprobada),
            ("Laboratorio de Cómputo 101", 3, EstadoReserva.Aprobada),
            ("Laboratorio de Cómputo 101", 4, EstadoReserva.Aprobada),
            ("Laboratorio de Cómputo 101", 5, EstadoReserva.Aprobada),
            ("Auditorio Central UPLA", 0, EstadoReserva.Aprobada),
            ("Auditorio Central UPLA", 1, EstadoReserva.Aprobada),
            ("Auditorio Central UPLA", 2, EstadoReserva.Aprobada),
            ("Auditorio Central UPLA", 3, EstadoReserva.Aprobada),
            ("Auditorio Central UPLA", 5, EstadoReserva.Aprobada),
            ("Sala de Grados y Títulos", 1, EstadoReserva.Aprobada),
            ("Sala de Grados y Títulos", 3, EstadoReserva.Aprobada),
            ("Sala de Grados y Títulos", 4, EstadoReserva.Aprobada),
            ("Laboratorio de Redes y Telecomunicaciones", 2, EstadoReserva.Aprobada),
            ("Laboratorio de Redes y Telecomunicaciones", 5, EstadoReserva.Aprobada),
            ("Laboratorio de Cómputo 101", 0, EstadoReserva.Pendiente),
            ("Auditorio Central UPLA", 1, EstadoReserva.Pendiente),
            ("Sala de Grados y Títulos", 2, EstadoReserva.Rechazada),
            ("Laboratorio de Redes y Telecomunicaciones", 3, EstadoReserva.Rechazada)
        };
        var ahora = DateTime.UtcNow;
        var primerDiaMes = new DateTime(
            ahora.Year, ahora.Month, 1, 12, 0, 0, DateTimeKind.Utc);
        var reservas = muestras.Select((muestra, indice) =>
        {
            var primerDiaRegistro = primerDiaMes.AddMonths(-muestra.MesesAtras);
            var diasDelMes = DateTime.DaysInMonth(
                primerDiaRegistro.Year, primerDiaRegistro.Month);
            var dia = muestra.MesesAtras == 0
                ? Math.Min(indice + 1, Math.Max(1, ahora.Day))
                : indice % diasDelMes + 1;
            var fechaRegistro = primerDiaMes
                .AddMonths(-muestra.MesesAtras)
                .AddDays(dia - 1)
                .AddHours(indice % 10);
            var resuelta = muestra.Estado != EstadoReserva.Pendiente;
            var horaInicio = new TimeOnly(7 + indice % 12, 0);

            return new Reserva
            {
                Id = Guid.Parse($"00000000-0000-0000-0000-{indice + 1:D12}"),
                Fecha = DateOnly.FromDateTime(fechaRegistro.AddDays(2)),
                HoraInicio = horaInicio,
                HoraFin = horaInicio.AddHours(1),
                Motivo = "Reserva de demostración para visualizar el sistema.",
                Estado = muestra.Estado,
                UsuarioId = docente.Id,
                AmbienteId = ambientes[muestra.Ambiente].Id,
                FechaRegistro = fechaRegistro,
                ResueltoPorId = resuelta ? administrador.Id : null,
                FechaResolucion = resuelta ? fechaRegistro.AddHours(1) : null
            };
        }).ToList();
        var idsReservaDemo = reservas.Select(r => r.Id).ToArray();
        var idsExistentes = await context.Reservas
            .Where(r => idsReservaDemo.Contains(r.Id))
            .Select(r => r.Id)
            .ToListAsync();
        var reservasFaltantes = reservas
            .Where(r => !idsExistentes.Contains(r.Id))
            .ToList();

        if (reservasFaltantes.Count > 0)
        {
            await context.Reservas.AddRangeAsync(reservasFaltantes);
            await context.SaveChangesAsync();
        }
    }
}
