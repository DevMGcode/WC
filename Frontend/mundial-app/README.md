# ⚽ Mundial 2026 App - Frontend

**Aplicación responsive de predicciones y seguimiento del Mundial de Fútbol 2026**

## 🎯 Características

✅ **Onboarding Completo** - Flujo de bienvenida con selección de idioma, equipos favoritos y notificaciones
✅ **Home Dashboard** - Vista general con próximos partidos, últimos resultados y noticias
✅ **Calendario Interactivo** - Todos los partidos con filtros y detalles
✅ **Detalle de Partidos** - Alineaciones, eventos, estadísticas y análisis
✅ **Grupos y Cruces** - Tablas de posiciones y bracket del torneo
✅ **Porras Sociales** - Sistema de predicciones, rankings y ligas privadas
✅ **Perfil de Usuario** - Configuración, favoritos, estadísticas y preferencias
✅ **Diseño Responsive** - Optimizado para móvil, tablet y desktop
✅ **Paleta de Colores Vibrante** - Diseño deportivo y llamativo para hombres

## 🛠️ Stack Técnico

- **Framework**: Next.js 14
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 3.3
- **HTTP Client**: Axios
- **Estado**: Zustand (preparado)
- **Iconos**: React Icons
- **Fechas**: date-fns
- **Animaciones**: Framer Motion

## 📁 Estructura del Proyecto

```
mundial-app/
├── src/
│   ├── app/                    # Rutas de Next.js App Router
│   │   ├── onboarding/        # Flujo de onboarding (4 pasos)
│   │   ├── fixtures/          # Calendario y detalle de partidos
│   │   ├── groups/            # Grupos y tabla de posiciones
│   │   ├── predictions/       # Porras, ranking y ligas
│   │   ├── profile/           # Perfil y configuración
│   │   ├── layout.tsx         # Layout global
│   │   ├── page.tsx           # Home/Dashboard
│   │   └── globals.css        # Estilos globales
│   │
│   ├── components/
│   │   ├── Button.tsx         # Componentes Button, Card, Badge, Spinner
│   │   ├── Cards.tsx          # TeamCard, FixtureCard
│   │   └── Navigation.tsx     # Navbar y Header responsivos
│   │
│   ├── services/              # Integración con Backend
│   │   ├── api.ts            # Cliente HTTP y auth
│   │   ├── tournament.ts     # Torneos, equipos, partidos
│   │   ├── predictions.ts    # Predicciones y scoring
│   │   └── user.ts           # Favoritos, notificaciones, contenido
│   │
│   ├── types/
│   │   └── index.ts          # Interfaces TypeScript (alineadas con BD)
│   │
│   ├── hooks/                # Custom React hooks (preparado)
│   ├── utils/                # Funciones utilitarias (preparado)
│   └── constants/            # Constantes (preparado)
│
├── public/                    # Assets estáticos
├── tailwind.config.js        # Configuración Tailwind con paleta custom
├── tsconfig.json             # Configuración TypeScript
├── next.config.js            # Configuración Next.js
├── package.json              # Dependencias
└── README.md
```

## 🎨 Paleta de Colores (Diseño para Hombres)

```
Verde de Cancha:      #1e7e34 (Primario - vibrante)
Verde Claro:          #2ecc71 (Accent)
Dorado Energético:    #f39c12 (Secundario - atractivo)
Rojo Vibrante:        #e74c3c (Accent - emocional)
Azul Vibrante:        #3498db (Accent)
Negro Profundo:       #1a1a2e (Fondo oscuro)
Blanco Puro:          #ffffff (Contraste)
```

## 🚀 Instalación y Setup

### Requisitos Previos
- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# 1. Navegar a la carpeta del proyecto
cd mundial-app

# 2. Instalar dependencias
npm install
# o
yarn install

# 3. Configurar variables de entorno
# Crear archivo .env.local en la raíz:
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# 4. Ejecutar en desarrollo
npm run dev
# o
yarn dev

# 5. Abrir en navegador
# http://localhost:3000
```

### Build para Producción

```bash
npm run build
npm start
```

## 📱 Páginas Implementadas

| Página | Ruta | Estado | Características |
|--------|------|--------|-----------------|
| **Onboarding** | `/onboarding` | ✅ Completo | 4 pasos: idioma, equipos, notificaciones, resumen |
| **Home** | `/` | ✅ Completo | Dashboard con Stats, Próximos, Resultados, CTA |
| **Calendario** | `/fixtures` | ✅ Completo | Filtros, Lista de partidos, Links a detalle |
| **Detalle Partido** | `/fixtures/[id]` | ✅ Completo | Score, Eventos, Alineaciones, Estadísticas |
| **Grupos** | `/groups` | ✅ Completo | Tablas de posiciones, Cruces/Brackets |
| **Porras** | `/predictions` | ✅ Completo | Mis predicciones, Ranking global, Ligas privadas |
| **Perfil** | `/profile` | ✅ Completo | Datos, Favoritos, Configuración, Estadísticas |

## 🔌 Integración Backend

El frontend está preparado para consumir una API REST que siga esta estructura:

### Endpoints Esperados

```
POST   /api/auth/login                 - Login
POST   /api/auth/register              - Registro
POST   /api/auth/logout                - Logout
GET    /api/auth/me                    - Usuario actual

GET    /api/tournaments                - Listar torneos
GET    /api/tournaments/:id            - Detalle torneo
GET    /api/tournaments/current        - Torneo actual

GET    /api/fixtures                   - Listar partidos (con filtros)
GET    /api/fixtures/:id               - Detalle partido
GET    /api/fixtures/upcoming          - Próximos
GET    /api/fixtures/finished          - Finalizados

GET    /api/teams                      - Listar equipos
GET    /api/teams/:id                  - Detalle equipo

GET    /api/groups/:id                 - Detalle grupo
GET    /api/standings/group/:id        - Tabla de posiciones

POST   /api/predictions                - Crear predicción
PUT    /api/predictions/:id            - Actualizar predicción
GET    /api/predictions                - Mis predicciones

GET    /api/rankings/global/:tournamentId      - Ranking global
GET    /api/rankings/user/:tournamentId/position - Mi posición

POST   /api/leagues                    - Crear liga
GET    /api/leagues/:id                - Detalle liga
GET    /api/leagues/user               - Mis ligas
GET    /api/leagues/:id/ranking        - Ranking liga

POST   /api/favorites                  - Agregar favorito
DELETE /api/favorites/:teamId          - Eliminar favorito
GET    /api/favorites                  - Mis favoritos

GET    /api/notifications              - Mis notificaciones
GET    /api/notifications/preferences  - Mis preferencias
PUT    /api/notifications/preferences  - Actualizar preferencias

GET    /api/content/articles           - Artículos/noticias
GET    /api/content/team/:teamId       - Perfil de equipo
```

### Headers Esperados

```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

### Formato de Respuestas

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-04-12T14:30:00Z"
}
```

## 🐳 Docker — Comandos esenciales

> Ejecutar siempre desde la **raíz del repositorio** (`WC/`), no desde esta carpeta.

### Levantar todo el stack (primera vez o tras cambios estructurales)
```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml --profile dev up -d --build
```

### Reconstruir SOLO el frontend
```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml up -d --build frontend-dev
```

### Ver logs en vivo
```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml logs -f frontend-dev
```

### Reiniciar sin reconstruir (suele bastar)
```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml restart frontend-dev
```

### Detener todo
```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml --profile dev down
```

> **Hot reload activo:** los cambios en `.tsx` / `.ts` dentro de `src/` se aplican solos en el navegador. Solo necesitas `--build` si cambiaste `package.json`, `next.config.js` o el `Dockerfile`.

## 🔐 Autenticación

El flujo usa **JWT** con `accessToken` + `refreshToken`:

1. Login en `/login` → backend devuelve `{ accessToken, refreshToken, user }`.
2. Tokens se guardan en `localStorage` (`authToken`, `refreshToken`) y `user` también.
3. **`apiClient`** (axios) inyecta el `Bearer <token>` automáticamente en cada request.
4. **`apiFetch`** (helper para `fetch()` puro) hace lo mismo, drop-in replacement de `fetch`.
5. Si el backend responde **401**, se intenta refresh con el `refreshToken`. Si falla, limpia auth y redirige a `/login`.
6. `useAuth()` (de `AuthContext`) expone `user`, `isAuthenticated`, `login`, `logout`, `loading` y `error`.

```ts
// Uso desde un componente cliente
import { useAuth } from '@/contexts/AuthContext';

const { user, login, logout, isAuthenticated } = useAuth();
```

## 🎯 Sistema de puntuación

Las predicciones se puntúan automáticamente cuando el admin ingresa el resultado de un partido:

| Resultado | Puntos |
|---|---|
| 🎯 Marcador exacto (predijiste 2-1, terminó 2-1) | **3 pts** |
| ✅ Ganador correcto pero marcador distinto (predijiste 2-1, terminó 3-1) | **1 pt** |
| ✅ Empate correcto pero marcador distinto (predijiste 1-1, terminó 2-2) | **1 pt** |
| ❌ Resultado incorrecto | **0 pts** |

> Un empate exacto (predijiste 1-1 y terminó 1-1) vale **3 pts**, no 1.

## 🧪 Testing

La suite de tests usa **Jest + Testing Library + jsdom** y vive en una sola carpeta:

```
src/__tests__/
├── _helpers/              ← utilities compartidos (mockResponse, etc.)
├── unit/                  ← tests unitarios puros (sin DOM)
│   ├── i18n/              ← paridad de mensajes en los 7 idiomas
│   ├── lib/               ← apiFetch (wrapper con Bearer JWT)
│   ├── services/          ← apiClient, auth, publicApi, predictions
│   └── utils/             ← format (timezone fix, i18n de fechas)
└── integration/           ← tests con DOM + providers
    ├── AuthContext.test.tsx
    └── ErrorBoundary.test.tsx
```

### Comandos

```bash
# Todos los tests (corre dentro del container Docker)
docker exec mundial2026-frontend-DEV npx jest

# Solo unitarios (más rápido)
docker exec mundial2026-frontend-DEV npm run test:unit

# Modo watch para desarrollo activo (TDD)
docker exec -it mundial2026-frontend-DEV npm run test:watch

# Con cobertura HTML (se genera en /app/coverage/lcov-report/index.html)
docker exec mundial2026-frontend-DEV npx jest --coverage
```

### Si tienes Node 20+ instalado en tu host también funciona sin Docker:

```bash
cd Frontend/mundial-app
npm test
```

### Qué cubre la suite (a día de hoy)

| Categoría | Archivo | Qué valida |
|---|---|---|
| Helpers de UI | `getEffectiveStatus.test.ts` | Estado efectivo de un fixture (LIVE/SCHEDULED/FINISHED) según `kickoffAt` |
| Helpers de UI | `resolveBrandHex.test.ts` | Códigos hex de la paleta de marca (12 colores) |
| Hooks | `useCountdown.test.ts` | Countdown del Mundial 2026 |
| i18n | `i18n/messages-parity.test.ts` | Paridad de keys entre los 7 idiomas (es/en/de/fr/pt/ru/ar) |
| Helpers de red | `lib/apiFetch.test.ts` | Bearer JWT automático, fallback en SSR, headers custom |
| Services | `services/apiClient.test.ts` | axios + interceptor request/response |
| Services | `services/auth.test.ts` | login/register, anti-enumeración "Credenciales inválidas" |
| Services | `services/publicApi.test.ts` | Routing inteligente público/privado |
| Services | `services/predictions.test.ts` | Todos los paths nuevos sin `/public/` |
| Utils | `utils/format.test.ts` | Formato de fechas con `timeZone` fijo (anti-hidratación) |
| Componentes | `integration/AuthContext.test.tsx` | Provider + hook: login, logout, restaurar sesión |
| Componentes | `integration/ErrorBoundary.test.tsx` | Catch de errores en render + fallback |

**Resumen actual: 104 tests / 12 suites / 100% pass.**

### Configuración

- `jest.config.cjs` — root config (ESM, JSON imports, mocks de assets)
- `jest.setup.ts` — mocks globales (next/router, next-intl, matchMedia, IntersectionObserver, fetch nativo de Node)
- `jest.fileMock.js` — stub para imports de svg/png/etc.

## 📊 Base de Datos - Alineación

Los tipos TypeScript en `src/types/index.ts` están 100% alineados con:
- Tabla `app_user` → Interface `User`
- Tabla `tournament` → Interface `Tournament`  
- Tabla `team` → Interface `Team`
- Tabla `fixture` → Interface `Fixture`
- Tabla `user_prediction` → Interface `Prediction`
- Tabla `user_tournament_score` → Interface `UserTournamentScore`
- Y todas las demás tablas del documento de BD

## 🎯 Próximos Pasos

1. **Backend**: Implementar API Spring Boot con PostgreSQL
2. **Autenticación**: JWT con refresh tokens
3. **Real-time**: WebSockets para actualizaciones en vivo
4. **Notificaciones**: Push notifications
5. **Analytics**: Tracking de eventos
6. **PWA**: Instalar como app nativa

## 📝 Notas de Desarrollo

- ✅ Componentes reutilizables y mantenibles
- ✅ Tipos TypeScript completos para seguridad
- ✅ Responsive mobile-first
- ✅ Accesibilidad WCAG
- ✅ SEO optimizado (Next.js)
- ✅ Performance optimizado (Code splitting, Image optimization)
- ✅ Paleta de colores profesional y vibrante

## 🤝 Contribuyendo

Este frontend es parte del proyecto MVP Mundial 2026. Todas las decisiones de diseño y funcionalidad están alineadas con:
- Documento de Base de Datos PostgreSQL
- Informe Ejecutivo del MVP

## 📄 Documentación Relacionada

Todos los documentos de handoff están en la carpeta **`/documentos`**:

### Para desarrollador Backend (EMPIEZA AQUÍ):
- **GUIA_INICIO_BACKEND.md** 👈 **COMIENZA AQUÍ** - Tutorial paso a paso
- **handoff_frontend_backend_mvp.md** ← Detalles técnicos de los 22 endpoints
- **documento_bd_postgresql_escalable_mundial2026.docx** ← Esquema SQL de la BD

### Para referencia general:
- **COMUNICACION_BACKEND.md** ← Resumen técnico completo
- **matriz_cumplimiento_front_mvp.md** ← Estado actual vs. documento MVP
- **informe_ejecutivo_integrado_mvp_mundial_2026.docx** ← Documento de alcance del MVP

## 🐛 Error tracking (GlitchTip)

Esta app usa **[GlitchTip](https://glitchtip.com)** para captura de errores en runtime. Es **open-source (MIT)** y se ejecuta en su cloud free o auto-hospedado.

- **Servicio**: GlitchTip cloud free (1.000 eventos/mes) o self-hosted con docker-compose
- **DSN**: se configura via `NEXT_PUBLIC_GLITCHTIP_DSN` en `.env.local` o `docker-compose.dev.yml`
- **Dashboard de errores**: visible en `Admin → Analytics → "Ver issues en GlitchTip"`
- **Funciones soportadas**: captura de excepciones, breadcrumbs, performance básico
- **Funciones NO soportadas**: session replay, profiling (son features exclusivas de Sentry)

### Archivos de configuración
```
Frontend/mundial-app/
├── glitchtip.client.config.ts   ← cliente (browser)
├── glitchtip.server.config.ts   ← server (Node runtime)
├── glitchtip.edge.config.ts     ← edge runtime
├── instrumentation.ts           ← registra server/edge según runtime
└── instrumentation-client.ts    ← hook de transición de rutas
```

### Sobre la dependencia `@sentry/nextjs`

Notarás que en `package.json` aparece `@sentry/nextjs`. **No estamos usando Sentry**:
GlitchTip implementa el mismo protocolo que Sentry y su documentación oficial
recomienda usar los SDKs de Sentry como transporte (son MIT). Los eventos se
envían al DSN que configures — en este caso, tu GlitchTip — no a Sentry.

Los imports en el código usan alias `GlitchTip`:
```ts
import * as GlitchTip from '@sentry/nextjs';   // SDK transporte
GlitchTip.captureException(err);               // envía a tu GlitchTip
```

### Sin DSN configurado

Si `NEXT_PUBLIC_GLITCHTIP_DSN` está vacío, los archivos `glitchtip.*.config.ts`
no inicializan el SDK y la app funciona normalmente — solo no enviarás eventos
a ningún servidor remoto.

## 🛠️ Troubleshooting

### El frontend no toma cambios después de editar código

En el día a día el **hot reload** (Fast Refresh) debe tomar los cambios solo. Si no, prueba en orden:

1. **Cierra la pestaña del navegador y abre otra nueva** (resuelve ~90% de los casos — el navegador cachea chunks JS).
2. **Reinicia el container** desde Docker Desktop (botón ⏵ Restart en `mundial2026-frontend-DEV`).
3. **Hard reload con Ctrl+Shift+R** mientras la pestaña está abierta.

### Cambios siguen sin aplicarse después de los pasos anteriores

Esto pasa cuando el volumen persistente `worldcup_frontend_next_cache` (donde Next guarda su build) quedó con chunks viejos. **Casos típicos:**

- Refactor masivo (renombre de muchos imports o rutas en muchos archivos).
- Cambio de variables `NEXT_PUBLIC_*` en `docker-compose.dev.yml` (Next las "hornea" en build time).
- Actualización mayor de Next.js (13 → 14, 14 → 15).
- Errores "Module not found" o "Chunk failed to load" después de un `git pull` grande.

**Solución — limpiar el volumen `.next` y rearrancar:**

```powershell
cd C:\Users\Tecno\WC\Backend\worldCup

# 1. Para los containers (preservando volúmenes de datos)
docker-compose -f docker-compose.dev.yml --profile dev down

# 2. Borra solo el volumen del caché .next
docker volume rm worldcup_frontend_next_cache

# 3. Vuelve a levantar todo
docker-compose -f docker-compose.dev.yml --profile dev up -d
```

> El frontend tarda ~30-60s en arrancar limpio y compilar todo desde cero. Los datos de Postgres (porras, ligas, usuarios) **no se tocan** — están en otro volumen.

### Endpoints devuelven 401 / 403 inesperadamente

- Verifica que estás logueado: revisa `localStorage.authToken` en DevTools.
- Si el token expiró, vuelve a hacer login en `/es/login`.
- Si llamas a un endpoint privado (`/api/v1/predictions`, `/api/v1/leagues`, etc.), asegúrate de usar el helper `apiFetch` (`src/lib/apiFetch.ts`) en vez de `fetch()` directo — añade el Bearer automáticamente.

### Backend tarda en arrancar (~45s)

Spring Boot dev mode con Maven recompila el código al arrancar. Es normal. Verifica que está listo con:
```powershell
curl http://localhost:8080/actuator/health
```

## 👨‍💻 Autor

Desarrollado con ❤️ para la app del Mundial 2026

---

**Estado**: ✅ Pronto para Desarrollo Backend
**Última Actualización**: 12 de Abril, 2026
