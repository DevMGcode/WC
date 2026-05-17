# Guia para Descargar y Ejecutar el Proyecto con Docker

Este documento explica como clonar el proyecto y levantar **Frontend + Backend + PostgreSQL + pgAdmin** con Docker desde la raiz del repositorio (sin entrar a las carpetas Frontend o Backend).

---

## 1. Requisitos

- Git instalado
- Docker Desktop instalado y en ejecucion
- Puerto 3000 libre (Frontend)
- Puerto 8080 libre (Backend)
- Puerto 5434 libre (PostgreSQL)
- Puerto 5050 libre (pgAdmin)

---

## 2. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_REPOSITORIO>
```

---

## 3. Levantar todo con Docker

Desde la **raiz del repositorio**, ejecutar:

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml up -d --build
```

Este comando levanta:

- Frontend (Next.js) en `http://localhost:3000`
- Backend (Spring Boot) en `http://localhost:8080`
- PostgreSQL en `localhost:5434`
- pgAdmin en `http://localhost:5050`

---

## 4. URLs de los servicios

| Servicio    | URL                                          |
|-------------|----------------------------------------------|
| Frontend    | http://localhost:3000                        |
| Backend API | http://localhost:8080                        |
| Swagger UI  | http://localhost:8080/swagger-ui/index.html  |
| pgAdmin     | http://localhost:5050                        |
| PostgreSQL  | localhost:5434                               |

---

## 5. Verificar que todo quedo arriba

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml ps
```

Validar servicios con curl:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health
```

Respuesta esperada:

- Frontend: `200`
- Backend health: `200`

---

## 6. Comandos de uso frecuente

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

### Limpiar todo (contenedores + volumenes) — usar solo si algo esta muy roto

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml down -v --remove-orphans
```

---

## 7. ¿Cuándo usar `--build` y cuándo no?

| Situacion                                     | Comando                          |
|-----------------------------------------------|----------------------------------|
| Cambie codigo del frontend                    | `--build frontend`               |
| Cambie codigo del backend                     | `--build backend`                |
| Cambie `pom.xml` o dependencias Java          | `--build backend`                |
| Cambie `package.json` o dependencias JS       | `--build frontend`               |
| Cambie un `Dockerfile`                        | `--build` (ambos)                |
| Solo quiero reiniciar sin reconstruir         | `restart frontend` o `restart backend` |

> **Hot reload activo en desarrollo:** si solo cambiaste codigo fuente (`.tsx`, `.java`) sin tocar dependencias, los cambios se aplican solos sin necesidad de `--build`.

---

## 8. Arquitectura del repositorio

```
WC_repo/
├── Frontend/mundial-app/    # Next.js 14 + TypeScript + Tailwind
└── Backend/worldCup/        # Spring Boot 3.5 + Java 21 + PostgreSQL
```

- [Frontend — README](Frontend/mundial-app/README.md)
- [Backend — README](Backend/worldCup/README.md)

---

## 9. Notas importantes

- El **primer arranque** del backend puede tardar mas por descarga de dependencias Maven.
- El entorno esta configurado para desarrollo con volumenes, por lo que los cambios de codigo se reflejan sin rebuild completo.
- Si cambias dependencias base o Dockerfiles, vuelve a usar `--build`.

---

## 10. Solucion rapida de problemas

Si hay puertos ocupados, detener procesos locales que usen 3000 / 8080 / 5434 / 5050.

Si algun servicio falla al iniciar:

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml ps
docker compose -f Backend/worldCup/docker-compose.dev.yml logs --tail=200 backend
docker compose -f Backend/worldCup/docker-compose.dev.yml logs --tail=200 frontend
```

Si necesitas limpiar contenedores/volumenes de este stack:

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml down -v --remove-orphans
```
