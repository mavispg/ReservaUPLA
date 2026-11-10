using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ReservaUPLA.API.Middleware;
using ReservaUPLA.API.Models;
using ReservaUPLA.Application.Interfaces.Repositories;
using ReservaUPLA.Application.Interfaces.Services;
using ReservaUPLA.Application.Services;
using ReservaUPLA.Infrastructure.Data;
using ReservaUPLA.Infrastructure.Repositories;
using ReservaUPLA.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------
// Base de datos (S8: la cadena real vive en user-secrets, no en el repo)
// ---------------------------------------------------------------------
var cadenaConexion = builder.Configuration.GetConnectionString("ReservaUPLADB")
    ?? throw new InvalidOperationException(
        "Falta la cadena de conexión 'ReservaUPLADB'. Configúrala con dotnet user-secrets.");

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(cadenaConexion));

// ---------------------------------------------------------------------
// Inyección de dependencias: interfaces de Application -> implementaciones.
// ---------------------------------------------------------------------
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IAmbienteRepository, AmbienteRepository>();
builder.Services.AddScoped<IReservaRepository, ReservaRepository>();

builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IAmbienteService, AmbienteService>();
builder.Services.AddScoped<IReservaService, ReservaService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// Servicios de autenticación y seguridad criptográfica real
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IAuthService, AuthService>();

// ---------------------------------------------------------------------
// Autenticación JWT Bearer real (OWASP A01 / A07)
// ---------------------------------------------------------------------
var secretKey = builder.Configuration["Jwt:Key"]
    ?? "ClaveSecretaReservaUPLA_SuperSegura2026_Minimo32Caracteres!";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers();

// ---------------------------------------------------------------------
// Respuesta uniforme cuando fallan las DataAnnotations (HTTP 400).
// ---------------------------------------------------------------------
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errores = context.ModelState
            .Where(x => x.Value is not null && x.Value.Errors.Count > 0)
            .SelectMany(x => x.Value!.Errors.Select(e => new
            {
                Campo = string.IsNullOrWhiteSpace(x.Key) ? "general" : x.Key,
                Mensaje = string.IsNullOrWhiteSpace(e.ErrorMessage)
                    ? "Dato inválido."
                    : e.ErrorMessage
            }))
            .GroupBy(x => x.Campo)
            .ToDictionary(
                g => g.Key,
                g => g.Select(x => x.Mensaje).Distinct().ToArray());

        return new BadRequestObjectResult(new ApiErrorResponse
        {
            Message = "Datos inválidos.",
            Errors = errores
        });
    };
});

// ---------------------------------------------------------------------
// Swagger con candado de autorización Bearer Token
// ---------------------------------------------------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ReservaUPLA API - Autenticación Real",
        Version = "v1",
        Description = "Sistema de Gestión de Reservas de Ambientes - Universidad Peruana Los Andes.\n" +
                      "Autenticación criptográfica con JWT y contraseñas hasheadas con BCrypt."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingresa el token JWT obtenido en POST /api/auth/login con el prefijo Bearer. Ejemplo: 'Bearer eyJhbGci...'"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ---------------------------------------------------------------------
// S7: CORS restringido al frontend local.
// ---------------------------------------------------------------------
const string politicaCors = "AllowFrontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(politicaCors, policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// ---------------------------------------------------------------------
// S9: errores controlados con ILogger y mensajes genéricos al cliente.
// ---------------------------------------------------------------------
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(politicaCors);

// Orden estricto de middlewares de seguridad
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/api/health", () => Results.Ok(new
{
    success = true,
    message = "API ReservaUPLA activa con autenticación JWT real.",
    data = DateTime.UtcNow
}));

// ---------------------------------------------------------------------
// Siembra automática de datos iniciales universitarios (Seed Data)
// ---------------------------------------------------------------------
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DatabaseSeeder.InicializarAsync(db);
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogWarning(ex, "No se pudo ejecutar el seeder automático en el arranque (posible base de datos aún no creada).");
}

app.Run();
