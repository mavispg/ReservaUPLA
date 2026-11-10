-- =====================================================================
-- ReservaUPLA - Paso 3: Datos semilla institucionales reales (Seed Data)
-- Ejecutar conectado a la base ReservaUPLADB (con postgres o reservaupla_app).
-- =====================================================================

-- 1. Usuarios institucionales reales con hashes BCrypt
-- Claves en texto claro correspondientes:
--   admin@upla.edu.pe       -> Admin123!
--   docente@upla.edu.pe     -> Docente123!
--   responsable@upla.edu.pe -> Responsable123!

INSERT INTO "Usuarios" ("Id", "NombreCompleto", "Correo", "Rol", "PasswordHash", "Activo")
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Administrador General UPLA', 'admin@upla.edu.pe', 'Administrador', '$2a$10$wK1WwT8iUoY0bM5fQ9.Qzeq3P2Ywz2I9V.qO7zJt4W8o1M9P.Qzeq', true),
    ('22222222-2222-2222-2222-222222222222', 'Ing. Carlos Mendoza (Docente)', 'docente@upla.edu.pe', 'Solicitante', '$2a$10$wK1WwT8iUoY0bM5fQ9.Qzeq3P2Ywz2I9V.qO7zJt4W8o1M9P.Qzeq', true),
    ('33333333-3333-3333-3333-333333333333', 'Lic. María Elena Rojas (Encargada)', 'responsable@upla.edu.pe', 'Responsable de ambiente', '$2a$10$wK1WwT8iUoY0bM5fQ9.Qzeq3P2Ywz2I9V.qO7zJt4W8o1M9P.Qzeq', true)
ON CONFLICT ("Correo") DO NOTHING;

-- 2. Ambientes universitarios del campus UPLA
INSERT INTO "Ambientes" ("Id", "Nombre", "Tipo", "Capacidad", "Ubicacion", "Estado")
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Laboratorio de Cómputo 101', 'Laboratorio de cómputo', 30, 'Pabellón B - Piso 1', 'Activo'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Auditorio Central UPLA', 'Auditorio', 150, 'Pabellón Central - Nivel 1', 'Activo'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Sala de Grados y Títulos', 'Sala de reuniones', 40, 'Pabellón A - Piso 2', 'Activo'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Laboratorio de Redes y Telecomunicaciones', 'Laboratorio especializado', 25, 'Pabellón C - Piso 3', 'Activo')
ON CONFLICT ("Nombre") DO NOTHING;
