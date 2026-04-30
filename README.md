# WC

Proyecto con dos modulos:

- Frontend: [Frontend](Frontend)
- Backend: [Backend](Backend)

## Ejecutar con Docker (desarrollo)

Este es el flujo recomendado para levantar todo el proyecto completo: frontend, backend, PostgreSQL y pgAdmin.

Desde la raiz del repo:

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml up -d --build
```

### Servicios disponibles

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- PostgreSQL: localhost:5434
- pgAdmin: http://localhost:5050

### Verificar que quedo arriba

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml ps
```

### Detener todo

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml down
```

### Notas

- Si quieres trabajar solo el backend, el README de [Backend/worldCup/README.md](Backend/worldCup/README.md) explica el arranque aislado.
- Para el uso normal del proyecto, usa la compose de desarrollo de este README.
