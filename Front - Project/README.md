# ConciliaYa – Frontend (Fase 2)

React 18 + Vite + TailwindCSS 4, conectado al backend Spring Boot con **JWT**.
Contrato de la API: `FASE1_API.md`.

## Cómo ejecutarlo
```bash
npm install
cp .env.example .env      # ajusta VITE_API_BASE_URL si tu backend no está en :8080
npm run dev               # http://localhost:5173
```
El backend debe estar encendido (`CORS_ALLOWED_ORIGINS` ya permite `http://localhost:5173` por defecto).

## Arquitectura: organización «por tipo y features»
Las carpetas se organizan primero **por tipo** de archivo (api, components, hooks…) y, dentro de
`components/`, `hooks/` y `pages/`, **por feature** (auth, conflictos, mediaciones…).
```
src/
├─ api/            Capa de servicios: SOLO habla HTTP. Una pantalla nunca usa axios directamente.
│  ├─ apiClient.js        axios + interceptores (agrega el JWT; ante un 401 cierra sesión)
│  ├─ tokenStorage.js     único lugar que toca sessionStorage
│  └─ authApi · conflictosApi · mediacionesApi · notificacionesApi · usuariosApi · catalogosApi
├─ states/         AuthContext.jsx: estado global de sesión (AuthProvider)
├─ hooks/
│  ├─ auth/        useAuth (lee el estado de sesión)
│  └─ common/      useForm (formularios controlados) · useFetch (loading / error / data)
├─ utils/          validators · errors · estados · roles · format
├─ components/
│  ├─ common/      Alert · Async · EstadoBadge · FormField · Loading · Modal · PageHeader
│  ├─ layout/      AppLayout · Navbar
│  ├─ auth/        AuthCard · ProtectedRoute
│  ├─ dashboard/   StatCard
│  ├─ conflictos/  ConflictosTable
│  └─ mediaciones/ MediacionesTable · MediacionAdminForm · SesionForm · DictamenForm · ObservacionesForm
├─ pages/          Una pantalla por ruta, agrupadas por feature
│  ├─ auth/ (Login, Register) · dashboard/ (por rol) · conflictos/ · mediaciones/
│  └─ notificaciones/ · admin/ (TiposConflicto, Usuarios) · common/ (Forbidden, NotFound)
├─ App.jsx         Mapa de rutas       └─ main.jsx   Punto de arranque
```

## Flujo de datos (la frase para explicarlo)
```
Componente (pages/)  →  hook (hooks/common: useFetch / useForm)  →  servicio (api/*.js)
      ▲                                                     │ axios + interceptor (Bearer token)
      └──────── estado de React (data / loading / error) ◄──┴── Spring Boot  /api/...
```

## Autenticación y sesión
1. `Login` valida el formulario → `AuthContext.login()` → `POST /api/auth/login`.
2. Respuesta `{ token, id, nombre, correo, perfilId, rol }` → se guarda en `sessionStorage` y en el estado `user`.
3. `apiClient` (interceptor de petición) agrega `Authorization: Bearer <token>` a TODAS las llamadas.
4. Al recargar (F5), `AuthContext` revisa el token (¿expiró?) y confirma con `GET /api/auth/me`.
5. Si cualquier respuesta es 401 → interceptor de respuesta → `logout()` → `ProtectedRoute` manda a `/login`.
6. `ProtectedRoute` (rutas anidadas) exige sesión y, opcionalmente, `roles={['ADMIN']}`. La seguridad real es del backend.

## Pantallas y roles
| Ruta | Quién | Qué hace |
|---|---|---|
| `/login`, `/register` | Público | Formularios controlados con validación |
| `/dashboard` | Todos | Un dashboard distinto por rol (Usuario / Mediador / Admin) |
| `/conflictos` | Todos | «Mis conflictos» (Usuario) o todos (Admin/Mediador) con filtros |
| `/conflictos/nuevo`, `/:id/editar` | Todos / demandante o Admin | Crear y editar (solo ABIERTO) |
| `/conflictos/:id` | Partes, mediador, Admin | Detalle, cancelar, **asignar mediador (Admin)** |
| `/mediaciones`, `/mediaciones/:id` | Según rol | Sesiones, **registrar sesión y dictamen (Mediador)**, reprogramar/reasignar (Admin) |
| `/notificaciones` | Todos | Lista, marcar leída, contador en la barra |
| `/admin/tipos-conflicto`, `/admin/usuarios` | Solo Admin | CRUD con modal (Usuarios = forma de crear Mediadores) |

## Formularios (criterio académico #1)
Todos son **componentes controlados** (`value` + `onChange` ligados al estado de React).
`hooks/common/useForm.js` encapsula ese patrón (≈50 líneas con comentarios) y `utils/validators.js` tiene las reglas.
Validación: al salir del campo (blur) y al enviar; los errores del backend (`fieldErrors`, 409) se muestran en el formulario.
Los filtros de `Conflictos.jsx` y `ObservacionesForm.jsx` usan `useState` directo para mostrar el caso más simple.

## Eliminado respecto a la versión anterior
Feed, Demo, Gastos, Actividad, Configuración, `database/` (localDatabase + seed + modelos), `repositories/`,
`services/` (expense/storage/user), MUI, Emotion, framer-motion, react-hook-form, zod, recharts, date-fns, lucide, react-hot-toast.
Las imágenes de `assets/graficos` (generadas con Python) se retomarán en la Fase 3.
