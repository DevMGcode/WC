# Orionix Gol — Mundial 2026

App de predicciones del Mundial de Fútbol 2026. Predicciones, ligas privadas y rankings en tiempo real.

---

## DOCKER — COMANDOS ESENCIALES

> Todos los comandos se ejecutan desde la **raíz del repositorio** (`WC_repo/`).

### Levantar todo por primera vez (o después de cualquier cambio)

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml up -d --build
```

### Reconstruir SOLO el frontend (cambios en Frontend/)

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml up -d --build frontend
```

### Reconstruir SOLO el backend (cambios en Backend/)

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml up -d --build backend
```

### Ver logs en vivo

```bash
# Frontend
docker compose -f Backend/worldCup/docker-compose.dev.yml logs -f frontend

# Backend
docker compose -f Backend/worldCup/docker-compose.dev.yml logs -f backend
```

### Ver estado de los contenedores

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml ps
```

### Detener todo

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml down
```

### Limpiar todo (contenedores + volúmenes) — usar solo si algo está muy roto

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml down -v --remove-orphans
```

---

## ¿Cuándo usar `--build` y cuándo no?

| Situación | Comando |
|---|---|
| Cambié código del frontend | `--build frontend` |
| Cambié código del backend | `--build backend` |
| Cambié `pom.xml` o dependencias Java | `--build backend` |
| Cambié `package.json` o dependencias JS | `--build frontend` |
| Cambié un `Dockerfile` | `--build` (ambos) |
| Solo quiero reiniciar sin reconstruir | `restart frontend` o `restart backend` |

> **Hot reload activo en desarrollo:** si solo cambiaste código fuente (`.tsx`, `.java`) sin tocar dependencias, los cambios se aplican solos sin necesidad de `--build`.

---

## URLs de los servicios

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui/index.html |
| pgAdmin | http://localhost:5050 |
| PostgreSQL | localhost:5434 |

---

## Arquitectura

```
WC_repo/
├── Frontend/mundial-app/    # Next.js 14 + TypeScript + Tailwind
└── Backend/worldCup/        # Spring Boot 3.5 + Java 21 + PostgreSQL
```

- [Frontend — README](Frontend/mundial-app/README.md)
- [Backend — README](Backend/worldCup/README.md)
# WC
