# ConciliaYa – Backend Fase 1: contrato de API y reglas

## Variables de entorno
| Variable | Obligatoria | Descripción |
|---|---|---|
| `JWT_SECRET` | **Sí** (≥ 32 caracteres) | Sin ella la app no arranca |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` (≥ 8) | Recomendada | Crea el Admin inicial al arrancar (idempotente) |
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | No | Por defecto `localhost:3306/conciliadb`, `root`, vacío |
| `CORS_ALLOWED_ORIGINS` | No | Por defecto `http://localhost:5173` (lista separada por comas) |
| `JWT_EXPIRATION_MS` | No | Por defecto 8 h |

BD nueva: ejecutar `schema.sql`. BD existente: **backup** y luego `migration_fase1.sql`.

## Autenticación
Header `Authorization: Bearer <token>`. Roles por `perfil.id`: 1→ADMIN, 2→MEDIADOR, 3→USUARIO (perfil desconocido → USUARIO).
Los errores devuelven `{timestamp,status,error,message,path,fieldErrors?}` con 400/401/403/404/409/500.

## Endpoints
| Método y ruta | Acceso | Descripción |
|---|---|---|
| POST `/api/auth/login` | Público | → `{token,id,nombre,correo,perfilId,rol}`. Error genérico 401 |
| POST `/api/auth/register` | Público | Siempre crea perfil Usuario (3) |
| GET `/api/auth/me` | Autenticado | Usuario actual |
| GET `/api/health` | Público | |
| GET `/api/usuarios/directorio` | Autenticado | Candidatos a demandado `{id,nombre}` (perfil Usuario, activos, sin uno mismo) |
| GET `/api/usuarios/mediadores` | ADMIN | Mediadores activos `{id,nombre}` |
| GET/POST/PUT/DELETE `/api/usuarios[/{id}]` | ADMIN | CRUD (DELETE = baja lógica) |
| GET/POST/PUT/DELETE `/api/perfiles[/{id}]` | ADMIN | Perfiles base (1-3) no eliminables ni desactivables |
| GET `/api/tipos-conflicto[/{id}]` | Autenticado | No-admin ve solo activos |
| POST/PUT/DELETE `/api/tipos-conflicto[/{id}]` | ADMIN | DELETE = baja lógica |
| GET `/api/estados-conflicto[/{id}]` | Autenticado | **Solo lectura** |
| GET `/api/conflictos` | Autenticado | Admin: todos. Mediador: propios + asignados. Usuario: donde es parte |
| GET `/api/conflictos/{id}` | Parte / mediador asignado / Admin | |
| POST `/api/conflictos` | Autenticado | Body: `usuarioDemandadoId,tipoConflictoId,asunto,descripcion?,montoReclamado?`. Demandante = token. Estado ABIERTO |
| PUT `/api/conflictos/{id}` | Demandante / Admin | Solo ABIERTO |
| DELETE `/api/conflictos/{id}` | Demandante / Admin | Cancela (activo=false); solo ABIERTO |
| GET `/api/mediaciones`, `/{id}` | Admin / mediador asignado / partes | |
| POST `/api/mediaciones` | ADMIN | `{conflictoId,mediadorId,fechaProgramada?,lugar?}` → conflicto EN_MEDIACION |
| PUT `/api/mediaciones/{id}` | ADMIN / mediador asignado | Parcial. `mediadorId` solo Admin; `observaciones` solo el mediador |
| GET `/api/mediaciones/{id}/sesiones` | Admin / mediador / partes | |
| POST `/api/mediaciones/{id}/sesiones` | Mediador asignado | `{fecha,lugar?,observaciones}` |
| POST `/api/mediaciones/{id}/dictamen` | Mediador asignado | `{acuerdo:boolean,detalle}` → RESUELTO / CERRADO |
| GET `/api/notificaciones/mias` | Autenticado | Más recientes primero |
| GET `/api/notificaciones/mias/no-leidas/count` | Autenticado | `{count}` |
| PATCH `/api/notificaciones/{id}/leida` | Dueño | |
| PATCH `/api/notificaciones/mias/leidas` | Autenticado | Marca todas |

## Reglas de negocio
- ABIERTO → EN_MEDIACION (Admin asigna) → RESUELTO (acuerdo) | CERRADO (sin acuerdo). El cliente nunca fija el estado.
- Una sola mediación activa por conflicto (bloqueo pesimista contra concurrencia).
- El mediador debe tener perfil 2, estar activo y no ser parte del conflicto.
- El dictamen actualiza Mediacion y Conflicto en la misma transacción: `resultado`=`ACUERDO`|`SIN_ACUERDO`, `fechaCierre`, mediación `activo=false`.
- Notificaciones (misma transacción que la operación): al demandado al registrar/retirar; a ambas partes (y mediador) al asignar, reprogramar, reasignar, registrar sesión y dictaminar.
- Estado de la mediación = estado de su conflicto (`estadoCodigo`/`estadoNombre` en `MediacionResponse`).

## Nombres de campo para la capa Python (Fase 3)
`ConflictoResponse`: `id, demandanteId, demandadoId, tipoConflictoNombre, estadoConflictoNombre, asunto, descripcion, montoReclamado, fechaInicio, fechaCierre, resultado, activo, fechaAlta, mediadorId, mediadorNombre`.
`MediacionResponse`: `id, conflictoId, mediadorId, mediadorNombre, estadoNombre, fechaProgramada, lugar, observaciones, resultado, fechaRegistro, activo`.
