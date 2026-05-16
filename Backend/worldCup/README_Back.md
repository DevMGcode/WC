# Backend — Orionix Gol

API REST del Mundial 2026 construida con Spring Boot 3.5 y Java 21.

---

## DOCKER — COMANDOS ESENCIALES

> Ejecutar siempre desde la **raíz del repositorio** (`WC_repo/`), no desde esta carpeta.

### Levantar todo (primera vez o después de cambios)

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml up -d --build
```

### Reconstruir SOLO el backend

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml up -d --build backend
```

### Ver logs del backend en vivo

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml logs -f backend
```

### Reiniciar el backend sin reconstruir

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml restart backend
```

### Detener todo

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml down
```

> **Hot reload activo:** cambios en `.java` se aplican solos gracias a Spring DevTools. Solo usa `--build backend` si cambiaste `pom.xml` o el `Dockerfile`.

---

## Stack técnico

| Tecnología | Versión | Uso |
|---|---|---|
| Java | 21 | Lenguaje |
| Spring Boot | 3.5 | Framework |
| Spring Security | — | JWT + CORS |
| Spring Data JPA | — | Persistencia |
| Flyway | — | Migraciones de BD |
| PostgreSQL | 17 | Base de datos |
| Lombok | — | Reducción de boilerplate |
| Springdoc OpenAPI | — | Swagger UI |

## Ejecutar en desarrollo

### Opción A — Docker Compose completo (recomendado)

Desde la raíz del repositorio:

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml up -d --build
```

El backend queda disponible en `http://localhost:8080`.

### Opción B — Solo PostgreSQL + app local

```bash
# Levantar solo la base de datos
docker compose -f docker-compose.dev.yml up -d postgres

# Correr la app con Maven
./mvnw spring-boot:run
```

### Ver logs en vivo

```bash
docker compose -f docker-compose.dev.yml logs -f --since=2m backend
```

### Reconstruir si cambias dependencias

```bash
docker compose -f docker-compose.dev.yml up -d --build backend
```

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `DB_URL` | URL JDBC de PostgreSQL | `jdbc:postgresql://postgres:5432/mundial2026` |
| `DB_USERNAME` | Usuario de la BD | `mundial2026` |
| `DB_PASSWORD` | Contraseña de la BD | — |
| `JWT_SECRET` | Clave secreta para firmar tokens | — |

## Swagger

Con la app corriendo:

```
http://localhost:8080/swagger-ui/index.html
```

## Módulos

El código está organizado por dominio bajo `src/main/java/com/mundial2026/backend/`:

```
backend/
├── common/          # ApiResponse, PaginatedResponse, excepciones globales
├── config/          # OpenAPI config
├── security/        # JWT filter, token provider, SecurityConfig
├── user/            # Autenticación, registro, perfil de usuario
├── tournament/      # Torneo, equipos, partidos, grupos, tabla de posiciones
├── prediction/      # Predicciones de usuario
├── scoring/         # Cálculo de puntos, rankings
└── league/          # Ligas privadas
```

## API Endpoints

Base URL: `/api/v1/public`

### Autenticación — `/auth`

```
POST   /auth/register             Registrar nuevo usuario
POST   /auth/login                Iniciar sesión → devuelve JWT
GET    /auth/me                   Obtener usuario del token actual
```

### Usuarios — `/users`

```
PUT    /users/{id}/profile        Actualizar nombre de usuario
PUT    /users/{id}/password       Cambiar contraseña
```

### Torneo — `/tournaments`

```
GET    /tournaments                            Listar todos los torneos
GET    /tournaments/{id}                       Detalle de torneo
GET    /tournaments/{id}/fixtures              Todos los partidos del torneo
GET    /tournaments/{id}/groups                Grupos con tabla de posiciones calculada
GET    /tournaments/fixtures/live              Partidos con estado LIVE
GET    /tournaments/fixtures/{id}              Detalle de partido con equipos y venue
PATCH  /tournaments/fixtures/{id}/result       Actualizar resultado (pone status FINISHED)
```

### Equipos — `/teams`

```
GET    /teams                     Listar todos los equipos
GET    /teams/{id}                Detalle de equipo
```

### Predicciones — `/predictions`

```
POST   /predictions                            Crear predicción
PUT    /predictions/{id}                       Actualizar predicción (solo antes del partido)
GET    /predictions/{id}                       Obtener predicción por ID
GET    /predictions/user/{userId}              Todas las predicciones de un usuario
GET    /predictions/fixture/{fixtureId}        Predicción del usuario autenticado para un partido
DELETE /predictions/{id}                       Eliminar predicción
```

### Puntuación — `/scores`

```
GET    /scores/user/{tournamentId}             Puntuación total del usuario autenticado
GET    /scores/history/{tournamentId}          Historial de predicciones puntuadas
```

### Ranking — `/rankings`

```
GET    /rankings/global/{tournamentId}         Ranking global paginado (page, pageSize)
GET    /rankings/user/{tournamentId}/position  Posición del usuario en el ranking
```

### Ligas privadas — `/leagues`

```
GET    /leagues                                Listar todas las ligas
POST   /leagues                                Crear liga
GET    /leagues/{id}                           Detalle de liga
GET    /leagues/user/{userId}                  Ligas de un usuario
GET    /leagues/{id}/members                   Miembros de la liga
GET    /leagues/{id}/ranking                   Ranking de la liga
POST   /leagues/join                           Unirse a liga con código
POST   /leagues/{id}/leave                     Salir de la liga
POST   /leagues/{id}/transfer-ownership        Transferir propiedad de la liga
DELETE /leagues/{id}                           Eliminar liga (solo el dueño)
```

### Health

```
GET    /health                    Estado del servicio
```

## Formato de respuestas

Todas las respuestas siguen el envelope:

```json
{
  "success": true,
  "message": "Descripción del resultado",
  "data": { ... },
  "timestamp": "2026-05-08T14:30:00Z"
}
```

Los errores devuelven `"success": false` con un objeto `error` que incluye `code` y `message`.

## Base de datos

Las migraciones se ejecutan automáticamente con Flyway al iniciar la app.

| Migración | Contenido |
|---|---|
| V1 | Esquema completo: tablas core, extensiones UUID |
| V2 | Usuario demo (`demo@example.com`) |
| V3 | Hash bcrypt del password del usuario demo |
| V4 | Usuario administrador (`admin@example.com`) |
| V5 | Hash bcrypt del password del administrador |
| V6 | Datos demo: torneo Mundial 2026, equipos, partidos de grupos |
| V7 | Tablas ligas privadas y ledger de puntuación |
| V8 | Grupos (A–H), equipos por grupo y standings iniciales |
| V9 | Fixtures de fase eliminatoria (octavos a final) |
| V10 | Partidos de grupo con datos reales (jornadas 1 y 2) |

## Sistema de puntuación

Cuando el admin actualiza el resultado de un partido (`PATCH /fixtures/{id}/result`), el `ScoringService` recalcula puntos para todas las predicciones de ese partido:

| Caso | Puntos |
|---|---|
| Marcador exacto | **3 pts** |
| Ganador correcto, marcador distinto | **1 pt** |
| Empate predicho + partido empatado, marcadores distintos | **1 pt** |
| Resultado incorrecto | **0 pts** |

Los puntos se acumulan en `user_tournament_score` y se reflejan en el ranking global y en cada liga privada.
