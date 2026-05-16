# Frontend — Orionix Gol

Interfaz web del Mundial 2026 construida con Next.js 14, TypeScript y Tailwind CSS.

---

## DOCKER — COMANDOS ESENCIALES

> Ejecutar siempre desde la **raíz del repositorio** (`WC_repo/`), no desde esta carpeta.

### Levantar todo (primera vez o después de cambios)

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml up -d --build
```

### Reconstruir SOLO el frontend

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml up -d --build frontend
```

### Ver logs del frontend en vivo

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml logs -f frontend
```

### Reiniciar el frontend sin reconstruir

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml restart frontend
```

### Detener todo

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml down
```

> **Hot reload activo:** cambios en `.tsx` / `.ts` dentro de `src/` se aplican solos en el navegador. Solo usa `--build frontend` si cambiaste `package.json`, `next.config.js` o el `Dockerfile`.

---

## Stack técnico

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 14 | Framework (App Router) |
| TypeScript | 5 | Lenguaje |
| Tailwind CSS | 3.3 | Estilos |
| Framer Motion | — | Animaciones |
| Axios | — | Cliente HTTP |
| React Icons | — | Iconografía |
| date-fns | — | Formato de fechas |

## Ejecutar en desarrollo

```bash
cd Frontend/mundial-app
npm install
npm run dev
```

La app queda disponible en `http://localhost:3000`.

### Variable de entorno requerida

Crear `.env.local` en `Frontend/mundial-app/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Si usas Docker Compose desde la raíz del repo, esto ya viene configurado automáticamente.

### Build de producción

```bash
npm run build
npm start
```

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Home — próximos partidos, últimos resultados, acceso rápido |
| `/login` | Inicio de sesión con email y contraseña |
| `/onboarding` | Bienvenida y configuración inicial del usuario |
| `/fixtures` | Calendario de partidos con filtros por fecha y estado |
| `/fixtures/[id]` | Detalle del partido — score, predicción, reglas de puntuación |
| `/groups` | Grupos del torneo con tabla de posiciones en vivo |
| `/predictions` | Mis predicciones, ranking global y ligas privadas |
| `/predictions/create-league` | Crear una liga privada y obtener el código de invitación |
| `/predictions/join-league` | Unirse a una liga existente con código |
| `/predictions/leagues/[id]` | Detalle de liga — ranking de miembros y gestión |
| `/profile` | Perfil del usuario, cambio de contraseña y datos |
| `/admin` | Panel de administrador — ingresar resultados de partidos |

> `/admin` solo es accesible para el usuario `admin@example.com`.

## Estructura del proyecto

```
src/
├── app/                        # Rutas (Next.js App Router)
│   ├── page.tsx                # Home
│   ├── login/
│   ├── onboarding/
│   ├── fixtures/
│   │   └── [id]/               # Detalle de partido
│   ├── groups/
│   ├── predictions/
│   │   ├── create-league/
│   │   ├── join-league/
│   │   └── leagues/[id]/
│   ├── profile/
│   ├── admin/
│   ├── layout.tsx              # Layout global (proveedores, nav, header)
│   └── globals.css
│
├── components/
│   ├── Navigation.tsx          # Barra lateral (desktop) y bottom bar (móvil) + Header
│   ├── Bracket.tsx             # Bracket de eliminatorias
│   ├── BracketChampions.tsx    # Bracket con campeones
│   ├── Button.tsx              # Componentes Button, Card, Badge, Spinner
│   ├── Cards.tsx               # TeamCard, FixtureCard
│   └── IntroSplash.tsx         # Pantalla de splash animada
│
├── contexts/
│   └── AuthContext.tsx         # Proveedor de autenticación (useAuth hook)
│
├── services/
│   ├── api.ts                  # ApiClient — clase HTTP base con interceptores JWT
│   ├── auth.ts                 # authService — login, register, logout, token
│   ├── publicTournament.ts     # Torneos, fixtures, grupos
│   ├── publicApi.ts            # Endpoints públicos adicionales
│   └── predictions.ts          # Predicciones, scoring, ligas privadas
│
└── types/
    └── index.ts                # Interfaces TypeScript alineadas con la BD
```

## Autenticación

El flujo de autenticación usa JWT:

1. Login en `/login` → el backend devuelve `accessToken`.
2. El token se guarda en `localStorage` como `authToken`.
3. `ApiClient` inyecta el token en cada request via header `Authorization: Bearer {token}`.
4. Si el backend responde `401`, el cliente limpia el token y redirige a `/login`.
5. `useAuth()` (de `AuthContext`) expone `user`, `isAuthenticated` y `loading` en cualquier componente.

## Sistema de puntuación

Las predicciones se puntúan automáticamente cuando el administrador ingresa el resultado del partido:

| Resultado | Puntos |
|---|---|
| Marcador exacto (ej. predijiste 2-1, terminó 2-1) | **3 pts** |
| Ganador correcto pero marcador distinto (ej. predijiste 2-1, terminó 3-1) | **1 pt** |
| Empate correcto pero marcador distinto (ej. predijiste 1-1, terminó 2-2) | **1 pt** |
| Resultado incorrecto | **0 pts** |

> Un empate exacto (predijiste 1-1 y terminó 1-1) vale **3 pts**, no 1.

## API que consume el frontend

Todas las rutas son relativas a `NEXT_PUBLIC_API_URL/v1/public`.

### Autenticación
```
POST   /auth/register            Registrar usuario
POST   /auth/login               Iniciar sesión
GET    /auth/me                  Obtener usuario autenticado
PUT    /users/{id}/profile       Actualizar perfil
PUT    /users/{id}/password      Cambiar contraseña
```

### Torneo
```
GET    /tournaments                          Listar torneos
GET    /tournaments/{id}                     Detalle de torneo
GET    /tournaments/{id}/fixtures            Partidos del torneo
GET    /tournaments/{id}/groups              Grupos y tabla de posiciones
GET    /tournaments/fixtures/{id}            Detalle de partido
GET    /tournaments/fixtures/live            Partidos en vivo
PATCH  /tournaments/fixtures/{id}/result     Ingresar resultado (solo admin)
GET    /teams                                Listar equipos
```

### Predicciones
```
POST   /predictions                          Crear predicción
PUT    /predictions/{id}                     Actualizar predicción
GET    /predictions/user/{userId}            Predicciones del usuario
GET    /predictions/fixture/{fixtureId}      Predicción del usuario para un partido
DELETE /predictions/{id}                     Eliminar predicción
```

### Ranking y puntuación
```
GET    /scores/user/{tournamentId}            Puntuación del usuario
GET    /scores/history/{tournamentId}         Historial de predicciones puntuadas
GET    /rankings/global/{tournamentId}        Ranking global paginado
GET    /rankings/user/{tournamentId}/position Posición del usuario en el ranking
```

### Ligas privadas
```
POST   /leagues                              Crear liga
GET    /leagues/{id}                         Detalle de liga
GET    /leagues/user/{userId}               Ligas del usuario
GET    /leagues/{id}/members                Miembros de la liga
GET    /leagues/{id}/ranking                Ranking de la liga
POST   /leagues/join                         Unirse a liga con código
POST   /leagues/{id}/leave                  Salir de la liga
POST   /leagues/{id}/transfer-ownership     Transferir propiedad
DELETE /leagues/{id}                         Eliminar liga
```
