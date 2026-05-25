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

## 🧪 Testing

Para pruebas locales, el app incluye datos mock:
- Mira `src/app/page.tsx` para ver cómo se usan los mocks
- Reemplaza con llamadas reales cuando el backend esté listo

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

## 👨‍💻 Autor

Desarrollado con ❤️ para la app del Mundial 2026

---

**Estado**: ✅ Pronto para Desarrollo Backend
**Última Actualización**: 12 de Abril, 2026
