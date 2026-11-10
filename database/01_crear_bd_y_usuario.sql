-- =====================================================================
-- ReservaUPLA - Paso 1: crear la base de datos y el usuario de la app
-- Ejecutar conectado como superusuario (postgres) con psql o pgAdmin.
--
-- IMPORTANTE (S11): la aplicación NO usa el usuario "postgres".
-- Usa un rol propio con permisos mínimos (solo DML sobre las tablas).
-- =====================================================================

-- 1) Rol de la aplicación. Cambia la clave por una fuerte y NO la subas al repositorio.
--    Esa misma clave se guarda luego con dotnet user-secrets.
CREATE ROLE reservaupla_app
    LOGIN
    PASSWORD 'ReservaApp2026'
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOINHERIT;

-- 2) Base de datos. El dueño es postgres porque las migraciones (DDL) las ejecuta
--    un usuario administrador; la app solo recibe permisos de lectura/escritura.
CREATE DATABASE "ReservaUPLADB"
    WITH OWNER = postgres
    ENCODING = 'UTF8'
    TEMPLATE = template0;

-- =====================================================================
-- Comprobación:
--   \du reservaupla_app
--   \l "ReservaUPLADB"
-- =====================================================================
