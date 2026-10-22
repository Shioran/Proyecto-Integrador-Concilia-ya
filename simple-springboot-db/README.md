# ConciliaYa - Spring Boot Backend (Integrado)

Backend REST API en Spring Boot 3.1.6 + MySQL, integración completa del proyecto Node.js (lol).

## Lo que se integró desde el backend Node.js

| Funcionalidad | Node.js (lol) | Spring Boot (integrado) |
|---|---|---|
| Login / Register JWT | `authController.js` | `AuthController.java` |
| Password con bcrypt | `bcryptjs` | `BCryptPasswordEncoder` |
| Middleware JWT | `middlewares/auth.js` | `JwtAuthFilter.java` |
| CORS global | `cors()` en server.js | `SecurityConfig.java` |
| Modelo Publicacion | `publicaciones` table | `Publicacion.java` |
| Modelo Notificacion | `notificaciones` table | `Notificacion.java` |
| Campo password en Usuario | `usuarios.password` | `Usuario.java` |
| UsuarioService | directo en controller | `UsuarioService.java` |
| ConflictoService | directo en controller | `ConflictoService.java` |
| MediacionService | directo en controller | `MediacionService.java` |
| Health check | `GET /api/health` | `HealthController.java` |

## Endpoints disponibles

### Públicos (sin token)
- `POST /api/auth/login` — `{ "correo": "", "password": "" }`
- `POST /api/auth/register` — `{ "nombre": "", "apellido": "", "correo": "", "password": "" }`
- `GET /api/health`

### Protegidos (requieren `Authorization: Bearer <token>`)
- `GET/POST/PUT/DELETE /api/usuarios/{id}`
- `GET/POST/PUT/DELETE /api/perfiles/{id}`
- `GET/POST/PUT/DELETE /api/conflictos/{id}`
- `GET/POST/PUT/DELETE /api/mediaciones/{id}`
- `GET/POST/PUT/DELETE /api/tipos-conflicto/{id}`
- `GET/POST/PUT/DELETE /api/estados-conflicto/{id}`
- `GET/POST/DELETE /api/publicaciones/{id}`
- `GET /api/notificaciones`
- `GET /api/notificaciones/usuario/{usuarioId}`

## Setup

### 1. Base de datos
```sql
-- Ejecutar schema.sql en MySQL
mysql -u root -p < schema.sql
```

### 2. application.properties
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/conciliadb?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD

jwt.secret=cambiar_este_secreto_minimo_32_caracteres_seguro
jwt.expiration=28800000
```

### 3. Correr
```bash
mvn spring-boot:run
```
El servidor levanta en `http://localhost:8080`

## Dependencias nuevas en pom.xml
- `spring-boot-starter-security`
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (versión 0.11.5)
