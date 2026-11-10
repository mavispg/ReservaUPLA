# ReservaUPLA — Fase 1 (base del backend)

> Ruta usada en esta máquina: `C:\Users\Fabián\ReservaUPLA`.
> Si tu curso exige `C:\Ruta\ReservaUPLA`, mueve la carpeta completa y ajusta los comandos.

## Requisitos

- .NET SDK 8
- PostgreSQL 16 en `localhost:5432`
- Herramienta EF Core: `dotnet tool install --global dotnet-ef --version 8.*`

## 1. Crear base de datos y usuario

Conéctate como `postgres` (pgAdmin o psql) y ejecuta, en orden:

1. `database\01_crear_bd_y_usuario.sql` (cambia la clave del rol).
2. Aplica la migración (paso 3).
3. `database\02_permisos_app.sql` (después de que existan las tablas).

Con psql:

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -f "C:\Users\Fabián\ReservaUPLA\database\01_crear_bd_y_usuario.sql"
```

## 2. Guardar la cadena de conexión real (S8)

```powershell
Set-Location C:\Users\Fabián\ReservaUPLA
dotnet user-secrets init --project backend\ReservaUPLA.API

dotnet user-secrets set "ConnectionStrings:ReservaUPLADB" "Host=localhost;Port=5432;Database=ReservaUPLADB;Username=reservaupla_app;Password=TU_CLAVE_REAL" --project backend\ReservaUPLA.API
```

## 3. Migración inicial (DDL con un usuario administrador)

Las migraciones crean tablas, por eso se ejecutan una sola vez con `postgres`.
El secreto de `postgres` se pasa solo para ese comando (variable de entorno), no se guarda:

```powershell
Set-Location C:\Users\Fabián\ReservaUPLA

$env:ConnectionStrings__ReservaUPLADB = "Host=localhost;Port=5432;Database=ReservaUPLADB;Username=postgres;Password=TU_CLAVE_POSTGRES"
dotnet ef database update --project backend\ReservaUPLA.Infrastructure --startup-project backend\ReservaUPLA.API
Remove-Item Env:\ConnectionStrings__ReservaUPLADB
```

Luego ejecuta `database\02_permisos_app.sql` conectado a `ReservaUPLADB`.

## 4. Ejecutar la API

```powershell
Set-Location C:\Users\Fabián\ReservaUPLA
dotnet run --project backend\ReservaUPLA.API
```

- API: http://localhost:5153
- Swagger: http://localhost:5153/swagger
- Salud: http://localhost:5153/api/health

## Frontend

```powershell
Set-Location C:\Users\Fabián\ReservaUPLA\frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. El backend debe estar corriendo en el puerto 5153.
El puerto del frontend es fijo para coincidir con la política CORS.

- Login real en `/login` con correo institucional y contraseña (hasheo seguro BCrypt).
- Emisión y validación criptográfica de tokens JWT con roles y claims.
- Sesión persistida y sincronizada con el backend mediante `Authorization: Bearer <token>`.
- Tarjetas de autocompletado rápido para sustentación académica docente.
- Menú adaptado al rol, rutas protegidas y migas de pan.
- Pantallas: Dashboard, Reservas (con filtros), Nueva reserva, Detalle, Usuarios y Ambientes.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Inicia sesión con correo y contraseña, emite token JWT |
| GET | `/api/auth/perfil` | Obtiene los datos del perfil autenticado a partir del token |
| GET | `/api/usuarios` | Lista usuarios para los selects |
| POST | `/api/usuarios` | Registra un usuario (con contraseña hasheada en BCrypt) |
| GET | `/api/ambientes` | Lista ambientes para los selects |
| POST | `/api/ambientes` | Registra un ambiente |
| GET | `/api/reservas` | Listado con filtros `?estado=&ambienteId=&fecha=` |
| GET | `/api/reservas/{id}` | Detalle con solicitante, ambiente y auditoría |
| POST | `/api/reservas` | Registra una reserva (el solicitante se toma del token JWT) |
| PATCH | `/api/reservas/{id}/estado` | Aprueba, rechaza o cancela (el actor se toma del token JWT) |
| GET | `/api/dashboard` | Total, pendientes, aprobadas, rechazadas y ambiente más utilizado |
| GET | `/api/health` | Comprueba que la API está viva |

Ejemplos de filtros del listado:

```text
GET /api/reservas?estado=Aprobada
GET /api/reservas?ambienteId=GUID_DEL_AMBIENTE
GET /api/reservas?fecha=2026-11-20
GET /api/reservas?estado=Aprobada&ambienteId=GUID_DEL_AMBIENTE&fecha=2026-11-20
```

El "ambiente más utilizado" del dashboard se calcula solo con reservas **aprobadas**
(las que realmente ocuparon el ambiente).

Las pantallas usan estos endpoints; este bloque no requiere migraciones nuevas. Las respuestas usan:

```json
{ "success": true, "message": "...", "data": { } }
{ "success": false, "message": "...", "errors": { "Campo": ["mensaje"] } }
```

### Orden recomendado en Swagger

1. Crea un usuario con rol `Administrador` y otro con rol `Solicitante`.
2. Crea un ambiente.
3. Crea una reserva con el Id del solicitante y del ambiente.
4. Copia el Id de la reserva y usa `PATCH /api/reservas/{id}/estado`:

```json
{ "estado": "Aprobada", "usuarioAccionId": "ID_DEL_ADMINISTRADOR" }
```

> `usuarioAccionId` es una **simulación** del usuario autenticado. En producción
> debe obtenerse del token JWT/Identity, nunca del cuerpo de la petición.

## Estructura

```
ReservaUPLA\
├─ backend\
│  ├─ ReservaUPLA.Domain\          (entidades + constantes, sin dependencias)
│  ├─ ReservaUPLA.Application\     (DTOs, interfaces, servicios)
│  ├─ ReservaUPLA.Infrastructure\  (DbContext, repositorios, migraciones)
│  └─ ReservaUPLA.API\             (controllers, Program.cs, configuración)
├─ frontend\                       (React + Vite + Tailwind)
├─ database\
├─ .gitignore
└─ ReservaUPLA.sln
```
