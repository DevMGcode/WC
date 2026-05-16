# Guia para Descargar y Ejecutar el Proyecto con Docker

Este documento explica como clonar el proyecto y levantar **Frontend + Backend + PostgreSQL + pgAdmin** con Docker desde la raiz del repositorio (sin entrar a las carpetas Frontend o Backend).

## 1. Requisitos

- Git instalado
- Docker Desktop instalado y en ejecucion
- Puerto 3000 libre (Frontend)
- Puerto 8080 libre (Backend)
- Puerto 5434 libre (PostgreSQL)
- Puerto 5050 libre (pgAdmin)

## 2. Clonar el repositorio

En una terminal:

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_REPOSITORIO>
```

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

## 4. Verificar que todo quedo arriba

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml ps
```

Puedes validar servicios con:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health
```

Respuesta esperada:

- Frontend: `200`
- Backend health: `200`

## 5. Logs en vivo

Backend:

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml logs -f backend
```

Frontend:

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml logs -f frontend
```

## 6. Detener todo

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml down
```

## 7. Reiniciar reconstruyendo imagenes

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml up -d --build
```

## 8. Notas importantes

- El **primer arranque** del backend puede tardar mas por descarga de dependencias Maven.
- El entorno esta configurado para desarrollo con volumenes, por lo que los cambios de codigo se reflejan sin rebuild completo.
- Si cambias dependencias base o Dockerfiles, vuelve a usar `--build`.

## 9. Solucion rapida de problemas

Si hay puertos ocupados, detener procesos locales que usen 3000/8080/5434/5050.

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
