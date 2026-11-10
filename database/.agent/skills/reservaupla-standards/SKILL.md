---
name: reservaupla-standards
description: >-
  Estándares de arquitectura, usabilidad (ISO 9241, Nielsen, DCU), seguridad (OWASP, BCrypt)
  y reglas de negocio para el sistema ReservaUPLA de la Universidad Peruana Los Andes.
---

# ReservaUPLA Standards & Usability Guide

Esta skill define la guía de diseño, arquitectura, usabilidad y seguridad aplicada al desarrollo del sistema **ReservaUPLA** (Gestión de Ambientes Institucionales de la Universidad Peruana Los Andes).

---

## 1. Principios de Usabilidad y DCU (ISO 9241-11, ISO 9241-210, Nielsen y Shneiderman)

### A. Lenguaje del Usuario (Heurística 2 de Nielsen)
* **Regla estricta:** La interfaz de usuario (pantallas, botones, badges, modales) **NUNCA** debe mostrar jerga técnica de programadores.
* **Prohibido en UI:** Badges o textos como `"JWT Activo"`, `"Criptografía BCrypt"`, `"Protección OWASP"`, `"Anti sobre-posteo"`, `"Entidad DTO"`.
* La seguridad existe en el backend y se sustenta en el informe técnico, pero la interfaz habla exclusivamente el lenguaje institucional de la UPLA: *"Sistema Institucional de Gestión · UPLA"*, *"Disponibilidad en Tiempo Real"*, *"Trazabilidad y Aprobación"*.

### B. Validación Oportuna y Próxima al Problema (Feedback Docente)
* **Validación `onBlur`:** Cada campo del formulario se valida al desenfocar (cuando el usuario sale del input). El error se presenta de inmediato si el dato es incorrecto.
* **Limpieza reactiva:** Apenas el usuario empieza a tipear un dato válido, el error se retira en caliente.
* **Componente `FieldWrapper`:** Encapsula etiqueta siempre visible, asterisco rojo de obligatorio, texto de ayuda (*hint*) y mensaje de error asociado por ID (`role="alert"`, `aria-invalid`, `aria-describedby`).
* **Centralización de reglas (DRY / SRP):** Toda la lógica de validación reside en funciones puras en `frontend/src/utils/validation.js` (`validarCampoReserva`, `validarCampoAmbiente`, `validarCampoUsuario`, `esHorarioUniversitario`, `esHoraFinMayor`).

### C. Prevención Activa de Errores (Heurística 5 de Nielsen)
* **Restricción dinámica de rangos:** El componente `TimeInput` de la hora de fin vincula `min={formulario.horaInicio || "07:00"}` para que el selector nativo bloquee horas anteriores a la de inicio antes del envío.
* **Fechas pasadas bloqueadas:** `DateInput` vincula `min={hoyISO()}`.
* **Bloqueo de doble envío:** Los botones de submit muestran spinner, cambian su texto a *"Registrando..."*, aplican `disabled` y se protegen en código con `useRef` para evitar clics concurrentes.

### D. Notificaciones y Manejo de Diálogos (ISO 9241-110)
* **Banners en línea (`AlertMessage`):**
  * Para errores de reglas de negocio complejas (ej. choque de horario / traslape RN-01).
  * Son contextuales y persistentes; no desaparecen solos como los *toasts* para permitir al usuario leer las horas en conflicto mientras modifica los campos.
* **Modales emergentes (`ModalConfirmacion`):**
  * **Únicamente** para decisiones críticas o irreversibles: Aprobar, Rechazar (RN-06), Cancelar o Desactivar usuario.
  * Incluyen foco inicial seguro en "Cancelar", trampa de tabulación (*focus trap*) y cierre con `Escape`.
  * **Prohibido:** Modales emergentes para errores simples de validación de formulario (antipatrón de interrupción modal).

### E. Diseño Estético y Minimalista (Heurística 8 de Nielsen)
* **Cero duplicidad:** La barra lateral izquierda es exclusivamente para la navegación modular y la firma institucional en el pie. Toda la gestión del usuario activo (nombre, rol y botón "Cerrar sesión") reside en la esquina superior derecha del encabezado principal (*Header*).
* **Métricas adaptativas:** En `CardIndicador`, los valores numéricos usan `text-3xl font-extrabold`, mientras que los textos descriptivos o la frase *"Sin datos"* se ajustan a `text-base / text-lg font-semibold` con altura mínima fija (`min-h-[36px]`) para mantener las tarjetas de la grilla perfectamente niveladas.

---

## 2. Identidad Visual Institucional UPLA

* **Colores oficiales:**
  * Azul Institucional UPLA: `#0064a7` (Tailwind `brand-600`).
  * Azul Cielo de Acento: `#0077c8` (Tailwind `brand-500`).
  * Azul Marino de Fondo / Barra Lateral: `#0b1f38` con bordes `#122e54`.
* **Isotipo Oficial:**
  * Uso del isotipo hexagonal oficial (libro y llama) con transparencia nativa (`logo-isotipo-upla.png`).
  * Sin recuadros blancos artificiales estilo "calcomanía".
* **Tarjetas:**
  * Sin el borde superior tosco (`border-t-4`). En su lugar, bordes sutiles `border-slate-200/90`, esquinas `rounded-2xl` e íconos en cápsulas redondeadas con anillos de color tenue (`ring-1`).

---

## 3. Arquitectura y Reglas del Backend (.NET 8 + PostgreSQL)

* **Clean Architecture:** Domain $\rightarrow$ Application $\rightarrow$ Infrastructure $\rightarrow$ API.
* **Reglas de Negocio:**
  * **RN-01:** Validación de traslape con intervalo abierto `[HoraInicio, HoraFin)`. Se valida al registrar y se revalida al aprobar.
  * **RN-02:** Registro obligatorio de solicitante, ambiente, fecha, horario y motivo.
  * **RN-03:** Hora fin > Hora inicio.
  * **RN-04:** Horario permitido estrictamente entre 07:00 y 22:00.
  * **RN-05:** Solo administradores activos pueden aprobar o rechazar (guardando `ResueltoPorId` y `FechaResolucion`).
  * **RN-06:** Una reserva rechazada o cancelada es inmutable.
* **Seguridad y Base de Datos:**
  * Usuario de aplicación `reservaupla_app` con permisos mínimos (DML: SELECT, INSERT, UPDATE, DELETE).
  * Contraseñas protegidas mediante BCrypt (salt rounds 10).
  * Cadena de conexión protegida en `dotnet user-secrets` y `appsettings.Development.json`.
