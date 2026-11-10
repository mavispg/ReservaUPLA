# PROMPT DE MEJORAS Y REGLAS DE USABILIDAD — RESERVAUPLA

> **Instrucciones para combinar:** 
> Copia este bloque y agrégalo a tu prompt anterior (el que tienes en tu otra cuenta o historial) para consolidar todas las correcciones de arquitectura, base de datos, usabilidad (Nielsen, ISO 9241, DCU) y diseño institucional UPLA en una sola directiva maestra.

---

```markdown
═══════════════════════════════════════════════════════════════════════
DIRECTIVAS DE REFINAMIENTO, USABILIDAD Y SEGURIDAD (RESERVAUPLA)
═══════════════════════════════════════════════════════════════════════

1. CRITERIOS ESTRICTOS DE USABILIDAD Y UX (ISO 9241-11, ISO 9241-210, NIELSEN)
- LENGUAJE DEL USUARIO (Nielsen Heurística 2):
  Queda TERMINANTEMENTE PROHIBIDO incluir jerga técnica de desarrolladores en la interfaz gráfica (pantallas, botones, badges, modales o textos de bienvenida).
  * NO colocar badges ni textos como: "JWT Activo", "Criptografía BCrypt", "Protección OWASP", "Anti sobre-posteo", "Parámetros seguros".
  * La seguridad debe vivir en el backend y documentarse en el informe técnico, pero la interfaz de cara al docente y estudiante debe ser 100% institucional:
    - En el login: "Sistema Institucional de Gestión · UPLA", "Disponibilidad en Tiempo Real", "Trazabilidad y Aprobación", "Indicadores Académicos".
    - En la barra lateral: "ReservaUPLA · Campus Universitario".
- VALIDACIÓN OPORTUNA Y PRÓXIMA AL PROBLEMA (Feedback Criterio 4):
  * Los formularios deben validar campo por campo en el evento `onBlur` (al salir del input) para mostrar el error en el momento exacto en que ocurre.
  * Cuando el usuario empiece a corregir el dato tiroteando un valor válido, el error debe desaparecer en caliente (reactivo).
  * Todo campo debe utilizar el componente reutilizable `FieldWrapper`, el cual asocia etiqueta con `htmlFor`, asterisco de obligatorio, texto de ayuda (`hint`) y mensaje de error en rojo accesible (`role="alert"`, `aria-invalid`, `aria-describedby`).
  * Las reglas de validación deben estar centralizadas en funciones puras en `frontend/src/utils/validation.js` (SRP y DRY).
- PREVENCIÓN ACTIVA DE ERRORES (Nielsen Heurística 5):
  * En el formulario de reservas, el campo `Hora de fin` debe vincular dinámicamente `min={formulario.horaInicio || "07:00"}` para que el selector nativo del navegador bloquee horas anteriores a la de inicio antes de que el usuario envíe el formulario.
  * La fecha debe vincular `min={hoyISO()}` para imposibilitar físicamente la selección de fechas pasadas.
  * Prevención de doble envío: los botones de submit deben deshabilitarse (`disabled={loading}`), mostrar un spinner, cambiar su texto a "Registrando..." y protegerse internamente con `useRef` para bloquear clics concurrentes.
- NOTIFICACIONES Y MANEJO DE DIÁLOGOS (ISO 9241-110):
  * BANNERS EN LÍNEA (`AlertMessage`): Se usan para errores de reglas de negocio complejas (ej. choque de horario / traslape RN-01) y confirmaciones de éxito. Son persistentes para que el usuario pueda leer el horario ocupado mientras modifica los campos. NO usar notificaciones flotantes (toasts) que desaparezcan solas.
  * MODALES EMERGENTES (`ModalConfirmacion`): Se usan EXCLUSIVAMENTE para decisiones críticas o irreversibles: Aprobar reserva, Rechazar reserva (RN-06), Cancelar reserva o Desactivar usuario. Deben incluir trampa de foco (focus trap), foco inicial seguro en el botón "Cancelar" y cierre con la tecla Escape. PROHIBIDO usar modales emergentes para errores de validación de formulario (antipatrón de interrupción modal).
- DISEÑO ESTÉTICO Y SIN DUPLICIDAD (Nielsen Heurística 8):
  * La barra lateral izquierda es únicamente para la navegación modular y la firma institucional en el pie.
  * Toda la gestión del usuario activo (nombre, rol y botón "Cerrar sesión") debe ubicarse exclusivamente en la esquina superior derecha del encabezado principal (Header). Prohibido duplicar el botón de cerrar sesión en ambos lados.
  * Métricas del Dashboard: En `CardIndicador`, los números deben usar tipografía grande (`text-3xl font-extrabold`), pero los textos descriptivos o la frase "Sin datos" deben ajustarse automáticamente a tamaño proporcionado (`text-base / text-lg font-semibold`) con altura mínima fija (`min-h-[36px]`) para que todas las tarjetas de la grilla mantengan una línea horizontal perfectamente nivelada.

2. IDENTIDAD VISUAL INSTITUCIONAL UPLA (DISEÑO DIFERENCIADOR)
- Evitar plantillas genéricas de IA (fondos negros planos, rayas gruesas de colores arriba de las tarjetas, azul genérico de Tailwind).
- Paleta Oficial UPLA en `tailwind.config.js`:
  * Azul Institucional Oficial: `#0064a7` (Tailwind `brand-600`).
  * Azul Cielo de Acento: `#0077c8` (Tailwind `brand-500`).
  * Azul Marino UPLA para Sidebar: `#0b1f38` con bordes `#122e54`.
- Logotipo oficial:
  * Utilizar el Isotipo Oficial Hexagonal de la UPLA (llama y libro) con transparencia nativa (`logo-isotipo-upla.png`).
  * No encerrar el logotipo en recuadros blancos que parezcan calcomanías recortadas.
- Tarjetas de Contenido y Dashboard:
  * Tarjetas limpias y modernas con bordes sutiles `border-slate-200/90`, esquinas suaves (`rounded-2xl`) y elevación ligera al pasar el cursor (`hover:shadow-md`).
  * Íconos en cápsulas redondeadas con anillos de color tenue (`ring-1 ring-brand-200/70`).

3. BASE DE DATOS Y PERSISTENCIA (POSTGRESQL + EF CORE 8)
- La aplicación backend (.NET 8 Web API) NO debe usar el superusuario "postgres".
- Debe conectarse con el rol de aplicación propio `reservaupla_app` con permisos mínimos exclusivamente DML (SELECT, INSERT, UPDATE, DELETE).
- Las migraciones DDL se ejecutan con el usuario administrador de PostgreSQL, mientras que la API opera con `reservaupla_app`.
- Encriptación de contraseñas de usuarios con BCrypt (salt rounds 10).
- La contraseña de conexión a la base de datos `ReservaUPLADB` se administra con `dotnet user-secrets` y se respalda para desarrollo en `appsettings.Development.json`.
- En el seeder institucional (`DatabaseSeeder.cs`), inicializar con usuarios institucionales reales de la UPLA (`admin@upla.edu.pe`, `docente@upla.edu.pe`, `responsable@upla.edu.pe`) con contraseñas hasheadas en BCrypt correspondientes (`Admin123!`, `Docente123!`, `Responsable123!`).

4. SEGURIDAD Y PRIVACIDAD EN EL MÓDULO DE USUARIOS
- En la tabla de usuarios registrados, el Administrador NUNCA debe ver contraseñas en texto claro ni con botones de "mostrar/ocultar". Las contraseñas son unidireccionales por diseño (OWASP Top 10).
- Para restablecer credenciales olvidadas, el Administrador dispone de la acción de edición (modal) para asignar una nueva clave temporal, garantizando el principio de privacidad y mínimo privilegio.
═══════════════════════════════════════════════════════════════════════
```
