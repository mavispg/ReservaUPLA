using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Domain.Constants;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Infrastructure.Data;

/// <summary>
/// Contexto de EF Core. Toda la configuración de tablas, longitudes, índices
/// y relaciones vive aquí (Fluent API), no en las entidades de Domain.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Ambiente> Ambientes => Set<Ambiente>();
    public DbSet<Reserva> Reservas => Set<Reserva>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigurarUsuario(modelBuilder);
        ConfigurarAmbiente(modelBuilder);
        ConfigurarReserva(modelBuilder);
    }

    private static void ConfigurarUsuario(ModelBuilder modelBuilder)
    {
        var usuario = modelBuilder.Entity<Usuario>();

        usuario.ToTable("Usuarios");
        usuario.HasKey(u => u.Id);

        usuario.Property(u => u.NombreCompleto)
            .HasMaxLength(150)
            .IsRequired();

        usuario.Property(u => u.Correo)
            .HasMaxLength(150)
            .IsRequired();

        usuario.Property(u => u.Rol)
            .HasMaxLength(50)
            .IsRequired();

        usuario.Property(u => u.PasswordHash)
            .HasMaxLength(255)
            .IsRequired();

        usuario.Property(u => u.Activo)
            .IsRequired()
            .HasDefaultValue(true);

        // Un correo no puede repetirse: evita duplicar personas (prevención de errores).
        usuario.HasIndex(u => u.Correo)
            .IsUnique()
            .HasDatabaseName("IX_Usuarios_Correo_Unico");
    }

    private static void ConfigurarAmbiente(ModelBuilder modelBuilder)
    {
        var ambiente = modelBuilder.Entity<Ambiente>();

        ambiente.ToTable("Ambientes");
        ambiente.HasKey(a => a.Id);

        ambiente.Property(a => a.Nombre)
            .HasMaxLength(100)
            .IsRequired();

        ambiente.Property(a => a.Tipo)
            .HasMaxLength(50)
            .IsRequired();

        ambiente.Property(a => a.Capacidad)
            .IsRequired();

        ambiente.Property(a => a.Ubicacion)
            .HasMaxLength(100)
            .IsRequired();

        ambiente.Property(a => a.Estado)
            .HasMaxLength(30)
            .IsRequired()
            .HasDefaultValue(EstadoAmbiente.Activo);

        // Evita registrar dos veces el mismo ambiente con nombres distintos solo por espacios
        // (la normalización con Trim se hace antes de guardar).
        ambiente.HasIndex(a => a.Nombre)
            .IsUnique()
            .HasDatabaseName("IX_Ambientes_Nombre_Unico");

        ambiente.ToTable(t =>
        {
            t.HasCheckConstraint("CK_Ambientes_Capacidad_Positiva", "\"Capacidad\" > 0");
        });
    }

    private static void ConfigurarReserva(ModelBuilder modelBuilder)
    {
        var reserva = modelBuilder.Entity<Reserva>();

        reserva.ToTable("Reservas");
        reserva.HasKey(r => r.Id);

        reserva.Property(r => r.Fecha)
            .HasColumnType("date")
            .IsRequired();

        reserva.Property(r => r.HoraInicio)
            .HasColumnType("time")
            .IsRequired();

        reserva.Property(r => r.HoraFin)
            .HasColumnType("time")
            .IsRequired();

        reserva.Property(r => r.Motivo)
            .HasColumnType("text")
            .IsRequired();

        reserva.Property(r => r.Estado)
            .HasMaxLength(30)
            .IsRequired()
            .HasDefaultValue(EstadoReserva.Pendiente);

        reserva.Property(r => r.FechaRegistro)
            .HasColumnType("timestamptz")
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        reserva.Property(r => r.FechaResolucion)
            .HasColumnType("timestamptz");

        // Relaciones: Restrict protege el historial; no se puede borrar un usuario/ambiente con reservas.
        reserva.HasOne(r => r.Usuario)
            .WithMany(u => u.Reservas)
            .HasForeignKey(r => r.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        reserva.HasOne(r => r.Ambiente)
            .WithMany(a => a.Reservas)
            .HasForeignKey(r => r.AmbienteId)
            .OnDelete(DeleteBehavior.Restrict);

        reserva.HasOne(r => r.ResueltoPor)
            .WithMany(u => u.ReservasResueltas)
            .HasForeignKey(r => r.ResueltoPorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Índice para la consulta de RN-01 (ambiente + fecha + estado).
        reserva.HasIndex(r => new { r.AmbienteId, r.Fecha, r.Estado })
            .HasDatabaseName("IX_Reservas_Ambiente_Fecha_Estado");

        reserva.HasIndex(r => r.UsuarioId)
            .HasDatabaseName("IX_Reservas_UsuarioId");

        reserva.HasIndex(r => r.Fecha)
            .HasDatabaseName("IX_Reservas_Fecha");

        // S3 / RN-03 / RN-04: la base también rechaza horarios inválidos.
        reserva.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_Reservas_HoraFin_Mayor",
                "\"HoraFin\" > \"HoraInicio\"");

            t.HasCheckConstraint(
                "CK_Reservas_Rango_Permitido",
                "\"HoraInicio\" >= TIME '07:00' AND \"HoraFin\" <= TIME '22:00'");
        });
    }
}
