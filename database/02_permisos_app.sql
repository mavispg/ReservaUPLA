-- =====================================================================
-- ReservaUPLA - Paso 2: permisos mínimos para el usuario de la aplicación
-- Ejecutar conectado a la base ReservaUPLADB como postgres, DESPUÉS de
-- aplicar la migración (dotnet ef database update).
--
-- S11: solo SELECT/INSERT/UPDATE/DELETE. Sin CREATE, ALTER, DROP ni SUPERUSER.
-- =====================================================================

GRANT CONNECT ON DATABASE "ReservaUPLADB" TO reservaupla_app;
GRANT USAGE ON SCHEMA public TO reservaupla_app;

GRANT SELECT, INSERT, UPDATE, DELETE
    ON ALL TABLES IN SCHEMA public
    TO reservaupla_app;

GRANT USAGE, SELECT
    ON ALL SEQUENCES IN SCHEMA public
    TO reservaupla_app;

-- Si en el futuro se crean tablas desde postgres, heredarán estos permisos.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO reservaupla_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO reservaupla_app;

-- Endurecimiento: nadie del rol PUBLIC puede crear objetos en el esquema public.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- =====================================================================
-- Comprobación (debe devolver solo los 4 privilegios DML):
--   SELECT grantee, privilege_type
--   FROM information_schema.role_table_grants
--   WHERE grantee = 'reservaupla_app'
--   ORDER BY table_name, privilege_type;
-- =====================================================================
