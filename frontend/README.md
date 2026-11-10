# ReservaUPLA — Frontend

React + Vite (JavaScript) + Tailwind CSS 3.4.3 + react-router-dom.

## Requisitos

- Node.js 20 o superior
- Backend corriendo en `http://localhost:5153` (CORS permitido para el puerto 5173)

## Comandos

```powershell
Set-Location C:\Users\Fabián\ReservaUPLA\frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. El puerto es fijo (`strictPort`) para que coincida
con la política CORS del backend.

Otros comandos:

```powershell
npm run build    # compila la SPA en dist/
npm run preview  # sirve la compilación
npm run lint     # oxlint
```

## Estructura

```
src/
├─ components/     Componentes reutilizables (inputs, botones, tabla, modal, tarjetas)
├─ config/         URL única de la API
├─ context/        Usuario actual (simulación sin login)
├─ layouts/        MainLayout con menú, migas y selector de usuario
├─ pages/          Dashboard, Reservas, Nueva reserva, Detalle, Usuarios, Ambientes
├─ routes/         Definición de rutas de la SPA
├─ services/       Un archivo por recurso + httpClient uniforme
└─ utils/          normalizeText, formatDate
```

## Página de prueba de componentes (Fase 5)

En desarrollo, el dashboard muestra el enlace **"Ver componentes de prueba"**.
También puedes abrir directamente `http://localhost:5173/componentes`.

Muestra los componentes `TextInput`, `SelectInput`, `DateInput`, `TimeInput`,
`Button`, `AlertMessage`, `ModalConfirmacion`, `TableList`, `CardIndicador` y
`EstadoBadge`, con sus estados normal, error, deshabilitado y carga.

## Pantallas

| Ruta | Pantalla | Roles |
|---|---|---|
| `/dashboard` | Dashboard con 5 indicadores y últimas reservas | Todos |
| `/reservas` | Listado con filtros por estado, ambiente y fecha | Todos |
| `/reservas/nueva` | Formulario de nueva reserva | Solicitante y Administrador |
| `/reservas/:id` | Detalle, aprobar/rechazar/cancelar y auditoría | Todos (acciones según rol) |
| `/usuarios` | Listado y registro de usuarios | Administrador (o primer arranque) |
| `/ambientes` | Listado y registro de ambientes | Administrador; Responsable en solo lectura |
| `/componentes` | Página temporal de prueba de componentes | Desarrollo |

Primera vez: si la base no tiene usuarios, la app muestra un enlace para crear el
primer administrador desde `/usuarios`. Al crearlo queda seleccionado y aparece
el menú completo.

## Recursos gráficos

- **Logo UPLA:** marca oficial de la Universidad Peruana Los Andes
  (`upla.edu.pe`), versión horizontal para el login y hexágono para la barra
  lateral y el favicon.
- **Fondo del login:** foto de aula de Unsplash
  (`photo-1580582932707-520aed937b7b`), almacenada localmente para no depender
  de internet en tiempo de ejecución.

## Login simulado

No hay contraseña ni token. La ruta `/login` permite elegir el usuario con el
que se entra; la aplicación adapta el menú y las acciones a su rol.

- La sesión simulada guarda **solo el Id del usuario** en `sessionStorage`, para
  no perderla al recargar. No se guardan datos de negocio allí.
- El botón **Cerrar sesión** borra la sesión y vuelve a `/login`.
- Las rutas privadas redirigen a `/login` y, después de ingresar, vuelven a la
  ruta solicitada.
- Si no hay usuarios, `/login` ofrece el enlace para crear el primer
  administrador en `/usuarios`.

En producción, la identidad y el rol deben venir de **JWT/Identity**, con
contraseña y cookie HttpOnly; `sessionStorage` no es el mecanismo definitivo.

## Sesión simulada

No hay login. El selector "Usuario actual" guarda la selección **solo en
memoria** (React Context), nunca en localStorage. El menú cambia según el rol:

- **Administrador:** Dashboard, Reservas, Nueva reserva, Usuarios, Ambientes.
- **Solicitante:** Dashboard, Reservas, Nueva reserva.
- **Responsable de ambiente:** Dashboard, Reservas, Ambientes.

En producción, el usuario y el rol deben venir de un token JWT/Identity.
